import { Injectable } from '@nestjs/common';
import axios, { AxiosInstance } from "axios";
import { IHttpAdapter } from "../interfaces/http-adapter.interface";

@Injectable()
export class AxiosAdapter implements IHttpAdapter {

    private axios: AxiosInstance = axios;

    async get<T>( url: string ): Promise<T> {
        try {
            const { data } = await this.axios.get<T>( url );
            return data;

        } catch (error) {
            
            throw new Error('This is an error - Check logs');
        }
    }
}