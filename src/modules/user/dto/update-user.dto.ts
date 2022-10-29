import { PartialType } from '@nestjs/mapped-types';
import { IsBoolean, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { TransformToBoolean } from 'src/common/decorators/transform-to-boolean.decorator';
import { letterAcentNumber } from 'src/common/enums/regexp.constants';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) { 

    @IsOptional()
    @IsString()
    @MinLength(3)
    @MaxLength(30)
    @Matches(letterAcentNumber)
    readonly name?: string;

    @IsOptional()
    @IsString()
    @MinLength(3)
    @MaxLength(30)
    @Matches(letterAcentNumber)
    readonly surname?: string;

    @IsOptional()
    @IsString()
    @MinLength(1)
    @MaxLength(2500)
    readonly bio?: string;

    @IsOptional()
    @TransformToBoolean()
    @IsBoolean()
    readonly online?: boolean;
}
