import { IsEmail, IsNumber, IsOptional, Max, Min } from "class-validator";
import { ForgotPasswordValidation } from "../decorators/forgot-password-validation.decorator";

export class ForgotPasswordDto {

    @IsOptional()
    @IsEmail()
    readonly email?: string;

    @IsOptional()
    @IsNumber({ allowNaN: true })
    @Min(10000, { message: 'phone must not be less than 5 digits'})
    @Max(100000000000000, { message: 'phone must not be greater than 15 digits'})
    readonly phone?: number;

    @ForgotPasswordValidation()
    readonly validation?: boolean = true;
}
