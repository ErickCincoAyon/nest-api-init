export interface IGenericService {

    /**
     * * CRUD Service functions 
     * * Logic CRUD to database
     * @param createDto 
     */
    create<T,U>( createDto: U ): Promise<T>;
    findAll<T,U>( queries: U ): Promise<T>;
    findOne<T>( id: string ): Promise<T>;
    update<T,U>( id: string, updateDto: U ): Promise<T>;
    inactive<T>( id: string ): Promise<T>;
}
