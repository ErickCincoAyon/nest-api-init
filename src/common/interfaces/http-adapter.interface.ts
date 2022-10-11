export interface IHttpAdapter {
    get<T>( url: string ): Promise<T>;
}