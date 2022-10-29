import { User } from "src/modules/user/entities/user.entity";
import { IUser } from "./user.interface";

export interface ILoginResponse {
    user: User | IUser;
    token: string;
}