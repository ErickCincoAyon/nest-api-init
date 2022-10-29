import { Aggregate, AggregatePaginateResult, PaginateResult } from 'mongoose';
import { ConflictException, Injectable, InternalServerErrorException, Logger, NotFoundException } from "@nestjs/common";

import { PaginationDto } from '../dtos/pagination.dto';
import { IField } from "../interfaces/find-by-fields.interface";
import { IGenericService } from "../interfaces/generic-service.interface";
import { IConfigPagination } from "../interfaces/config-pagination.interface";
import { IPopulateField } from '../interfaces/populate-field.interface';

@Injectable()
export class GenericService implements IGenericService {

  public logger: Logger = new Logger( this.serviceName );
    
  constructor(
    private readonly docModel: any,
    readonly defaultPagination: IConfigPagination,
    private readonly serviceName: string,
  ) { }

  /** 
    * ! -------------------- !! -------------------- !! -------------------- !
    * *                        CRUD Service functions                        *
    * *                        Logic CRUD to database                        *
    * ! -------------------- !! -------------------- !! -------------------- !
    */
  
  async create<T,U>( createDto: U ): Promise<T> {
    try {
      return await this.docModel.create( createDto );
      
    } catch (error) { await this.handleExceptions( error ) };
  }

  async findAll<T,U extends PaginationDto>(
    queries: U, 
    populate: IPopulateField[] = undefined, 
    aggregate: Aggregate<T[]> = undefined,
  ): Promise<PaginateResult<T> | AggregatePaginateResult<T>> {

    const { defaultPage, defaultLimit, defaultOrder } = this.defaultPagination;
    const { page = defaultPage, limit = defaultLimit, order = defaultOrder, ...query } = queries;

    let docs: PaginateResult<T> | AggregatePaginateResult<T>;
    if ( !aggregate ) {

      if ( !populate ) {
        docs = await this.docModel.paginate( query, { page, limit, ...order });
      } else {
        docs = await this.docModel.paginate( query, { page, limit, ...order, populate });
      }

    } else {

      docs = await this.docModel.aggregatePaginate( aggregate, { page, limit, ...order });
      
    }
    
    if ( !docs || docs.docs.length === 0 )
      throw new NotFoundException(`Documents not found`);

    return docs;
  }

  async findOne<T>( id: string, populate: IPopulateField[] = undefined ): Promise<T> {
    let doc: T;
    if ( !populate ) {

      doc = await this.docModel.findById( id );
    } else {
      
      doc = await this.docModel.findById( id ).populate(populate);
    }
    
    if ( !doc )
      throw new NotFoundException(`doc with id: ${ id } not found`);

    return doc;
  }

  async update<T,U>( id: string, updateDto: U ): Promise<T> {
    await this.findOne( id );

    try {
      return await this.docModel.findByIdAndUpdate( id, updateDto, { new: true });
      
    } catch (error) { await this.handleExceptions( error ) };
  }

  async inactive<T>( id: string ): Promise<T> {
    await this.findOne( id );

    try {
      return await this.docModel.findOneAndUpdate({ _id: id }, { active: false }, { new: true });
      
    } catch (error) { await this.handleExceptions( error ) };
  }

  /** 
    * ! -------------------- !! -------------------- !! -------------------- !
    * *                          Another functions                           *
    * *                                                                      *
    * ! -------------------- !! -------------------- !! -------------------- !
    *
    * @param fields get an array of objects to search, you must proportionate
    * the 'field', 'value of field', and the type to search in the database
    * @returns 
    */

  async findByFields<T>( fields: IField[] ): Promise<T> {
    let query = new Object;
    fields.map(( field: IField ) => {
      if (( field.type === 'number' || field.type === 'id' || field.type === 'boolean' ) && String( field.value ).trim() !== '' ) {
        query[field.field] = field.value;
      } else {
        query[field.field] = { $regex: new RegExp(["^", field.value, "$"].join(""), "i") };
      }
    });
    
    const itemFound: T = await this.docModel.findOne( query );
    if( !itemFound ) return null;
    
    return itemFound;
  }


  /** 
    * ! -------------------- !! -------------------- !! -------------------- !
    * *                       Handle Exceptions Errors                       *
    * *                                                                      *
    * ! -------------------- !! -------------------- !! -------------------- !
    */

  private async handleExceptions( error: any ): Promise<void> {
    if ( error.code === 11000 ) 
      throw new ConflictException(`${ Object.keys( error.keyPattern ) } property value already exist`);
      
    this.logger.error( error );
    throw new InternalServerErrorException('Unexpected error, check server logs');
  }
}