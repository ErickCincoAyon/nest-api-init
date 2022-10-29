import { Injectable, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PaginateModel } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';

import * as argon2 from "argon2";
import { v4 as uuid } from 'uuid';
import { GenericService } from 'src/common/providers/generic.service';
import { ConfigService } from '@nestjs/config';
import { MailService } from 'src/mail/mail.service';
import { MULTIFACTOR_AUTH_TYPES } from 'src/common/enums/multifactor-auth.enum';

@Injectable()
export class UserService extends GenericService {

  constructor(
    @InjectModel( User.name ) readonly userModel: PaginateModel<User>,
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
  ) { 
    super( userModel, configService.get( 'pagination' ), 'UserService' )
  }


  async createUserDto( createUserDto: CreateUserDto ): Promise<User> {
    const { register_type } = createUserDto;

    const user = await this.create<User, CreateUserDto>({
      ...createUserDto,
      uuid: uuid(),
      multifactor_auth: register_type,
      password: await argon2.hash( createUserDto.password ),
    });
    
    try {
      if ( register_type === 'email' )
        this.mailService.welcomeUser( user, register_type );

      if ( register_type === 'phone' )
        this.mailService.welcomeUser( user, MULTIFACTOR_AUTH_TYPES.phone );

    } catch (error) { this.mailService.handleExceptions( error ) };

    return user;
  }

  async removeAllFilesFrom( type: string, id: string ): Promise<User> {

    if ( !['avatar', 'background'].includes( type ) )
      throw new BadRequestException(`${ type } is not a valid argument, you must send some of ['avatar', 'background']`);
    
    await this.findOne( id );
    const user: User = await this.userModel.findOneAndUpdate({ _id: id, [type]: { $exists: true }},{ $unset: { [type]: "" }}, { new: true })

    if ( !user )
      throw new BadRequestException(`user with id ${ id } don't have ${[ type ]}s`);

    return user;
  }

  async removeFileFrom( type: string, id: string, filename: string ): Promise<User> {
    let user: User;
    if ( !['avatar', 'background'].includes( type ) )
      throw new BadRequestException(`${ type } is not a valid argument, you must send some of ['avatar', 'background']`);

    await this.findOne( id );
    user = await this.userModel.findOneAndUpdate({ _id: id, [type]: { $in: [filename] }},{ $pull: { [type]: filename } },{ new: true });

    if ( !user )
      throw new BadRequestException(`image ${ filename } not exists in user ${[ type ]}s`);

    if ( user[type].length === 0 )
      user = await this.userModel.findOneAndUpdate({ _id: id, [type]: { $exists: true }},{ $unset: { [type]: "" }}, { new: true });

    return user;
  }

  async newPassword( userId: string, password: string ): Promise<User> {
    const updatedUser = await this.update<User, Object>( userId, { password: await argon2.hash( password ) });
    
    return updatedUser;
  }

  async fillUsersWithSeed( users: CreateUserDto[] ): Promise<boolean> {
    await this.userModel.deleteMany({});
    
    await Promise.all(
      users.map( async ( user: CreateUserDto ) => {
        const userSaved = await this.create<User, CreateUserDto>({
          ...user,
          uuid: uuid(),
          multifactor_auth: user.register_type,
          password: await argon2.hash( user.password ),
        });
        if ( !userSaved )
          throw new InternalServerErrorException(`Error saving users with seed method`); 
      })
    );

    return true;
  }
}
