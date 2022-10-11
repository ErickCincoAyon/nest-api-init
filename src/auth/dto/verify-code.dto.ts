import { IsString, MaxLength, MinLength } from "class-validator";

export class VerifyCodeDto {
    
    @IsString()
    @MinLength(5)
    @MaxLength(5)
    readonly code: string;
}