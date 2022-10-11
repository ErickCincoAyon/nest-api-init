// import { Transform, Type } from "class-transformer";
// import { IsBoolean, IsNumber, IsObject, IsOptional, IsPositive, Min } from "class-validator";
// import { TransformToBoolean } from "../decorators/transform-to-boolean.decorator";
// import { ValidateObjectProps } from "../decorators/validate-object-properties.decorator";
// import { FieldQueryValidation } from "../interfaces/field-validation.interface";

// const USER_FIELDS: FieldQueryValidation[] = [
//     { field: 'phone', type: 'number' },
//     { field: 'active', type: 'boolean' },
//     { field: 'username', type: 'mongo-regex-exact' },
//     { field: 'name', type: 'mongo-regex-contains' },
//     { field: 'email', type: 'string' },
// ];

// interface IUser {
//     phone?: number;
//     active?: boolean;
//     username?: RegExp;
//     name?: RegExp;
//     email?: RegExp;
// }

// export class PaginationDtooPPPPPS {

//     @IsOptional()
//     @IsNumber()
//     @IsPositive()
//     @Min(1)
//     limit?: number;

//     @IsOptional()
//     @IsNumber()
//     @Min(0)
//     offset?: number;

//     @IsOptional()
//     @TransformToBoolean()
//     @IsBoolean()
//     active?: boolean;

//     @IsOptional()
//     @ValidateObjectProps(USER_FIELDS)
//     @IsObject()
//     user?: IUser;

// }
