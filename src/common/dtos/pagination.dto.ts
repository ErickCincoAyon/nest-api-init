import { IsNumber, IsObject, IsOptional, IsPositive, Max, Min  } from "class-validator";
import { ValidateObjectProps } from "../decorators/validate-object-properties.decorator";
import { IFieldQueryValidation } from "../interfaces/field-validation.interface";

const SORT_FIELD: IFieldQueryValidation[] = [
    { field: 'sort', type: 'sort' },
];

interface Sort {
    sort: {
        _id: number;
    };
}

export class PaginationDto {

    @IsOptional()
    @IsNumber()
    @IsPositive()
    @Min(1)
    readonly page?: number;

    @IsOptional()
    @IsNumber()
    @IsPositive()
    @Min(1)
    readonly limit?: number;

    @IsOptional()
    @IsObject()
    @ValidateObjectProps(SORT_FIELD)
    readonly order?: Sort;
}
