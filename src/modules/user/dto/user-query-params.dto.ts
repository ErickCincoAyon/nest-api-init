import { IsBoolean, IsOptional } from "class-validator";
import { TransformToBoolean } from "src/common/decorators/transform-to-boolean.decorator";
import { TransformToMongoRegex } from "src/common/decorators/transform-to-mongo-regex.decorator";
import { PaginationDto } from "src/common/dtos/pagination.dto";

export class UserQueryParamsDto extends PaginationDto {

    @IsOptional()
    @TransformToMongoRegex()
    readonly username?: RegExp;

    @IsOptional()
    @TransformToMongoRegex()
    readonly name?: RegExp;

    @IsOptional()
    @TransformToMongoRegex()
    readonly surname?: RegExp;

    @IsOptional()
    @TransformToBoolean()
    @IsBoolean()
    readonly online?: boolean;
}