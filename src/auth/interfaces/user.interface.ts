export interface IUser {
    _id: string;
    uuid: string;
    username: string;
    email?: string;
    country_code?: number;
    phone?: number;
    password?: string;
    name?: string;
    surname?: string;
    bio?: string;
    avatar?: string[];
    background?: string[];
    roles: string[];
    banned: boolean;
    banned_until?: Date;
    online: boolean;
    miltifactor_auth: string;
    active: boolean;
}