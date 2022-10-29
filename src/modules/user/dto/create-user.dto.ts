import { IsEmail, IsEnum, IsNumber, IsOptional, IsString, IsUUID, Matches, Max, MaxLength, Min, MinLength } from "class-validator";
import { MULTIFACTOR_AUTH_TYPES } from "src/common/enums/multifactor-auth.enum";
import { letterAcentNumber, upperLowerNumber } from "src/common/enums/regexp.constants";
import { UserCreateValidation } from "../decorators/user-create-validation.decorator";
import { UserUpdateValidation } from "../decorators/user-update-validation.decorator";

export class CreateUserDto {

    /** 
     * ! ---------------------------------------------
     * * the values ​​of the following properties      *
     * * 'uuid' and 'multifactor_auth' are assigned  *
     * * in the method " async createUserDto() "     *
     * ! ---------------------------------------------
     */
    @IsOptional()
    @IsUUID()
    readonly uuid?: string;

    @IsOptional()
    @IsEnum( MULTIFACTOR_AUTH_TYPES )
    readonly multifactor_auth?: MULTIFACTOR_AUTH_TYPES;

    @UserCreateValidation()
    @IsEnum( MULTIFACTOR_AUTH_TYPES )
    readonly register_type: MULTIFACTOR_AUTH_TYPES;
    
    @IsString()
    @MinLength(3)
    @MaxLength(30)
    @Matches(letterAcentNumber)
    readonly username: string;

    @IsString()
    @MinLength(6)
    @MaxLength(50)
    @Matches(upperLowerNumber, {
        message: 'The password must have a Uppercase, lowercase letter and a number'
    })
    readonly password: string;
    
    @IsOptional()
    @IsEmail()
    readonly email?: string;

    @UserUpdateValidation()
    @IsOptional()
    @IsNumber()
    @Min(1)
    @Max(10000)
    readonly country_code?: number;

    @UserUpdateValidation()
    @IsOptional()
    @IsNumber()
    @Min(10000, { message: 'phone must not be less than 5 digits'})
    @Max(100000000000000, { message: 'phone must not be greater than 15 digits'})
    readonly phone?: number;
}
