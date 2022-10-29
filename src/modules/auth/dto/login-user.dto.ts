import { IsEmail, IsNumber, IsOptional, IsString, Matches, Max, MaxLength, Min, MinLength } from "class-validator";
import { upperLowerNumber } from "src/common/enums/regexp.constants";
import { LoginValidation } from "../decorators/login-validation.decorator";

export class LoginUserDto {
    
    @IsOptional()
    @IsEmail()
    readonly email?: string;

    @IsOptional()
    @IsNumber()
    @Min(10000, { message: 'phone must not be less than 5 digits'})
    @Max(100000000000000, { message: 'phone must not be greater than 15 digits'})
    readonly phone?: number;

    @LoginValidation()
    @IsString()
    @MinLength(6)
    @MaxLength(50)
    @Matches(upperLowerNumber, {
        message: 'The password must have a Uppercase, lowercase letter and a number'
    })
    readonly password: string;
}
