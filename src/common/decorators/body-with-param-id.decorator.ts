import { createParamDecorator, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';


/**
 * * This is a decorator to use instead of @Body() in update functions of Controllers
 * * This decorator realize the task to take the id from params of the request,
 * * take the body of the request and create a DTO with the validations adding
 * * the "id" to can validate with a @Decorator() a unique values in DTOs
 */
export const BodyWithParamId = createParamDecorator(
    async (value:  any, ctx: ExecutionContext) => {
    
        // extract Mongo ID and Body
        const id = ctx.switchToHttp().getRequest().params.id;
        const body = ctx.switchToHttp().getRequest().body;
        // Convert body to DTO object
        let dto = plainToInstance(value, { ...body, id });
        // Validate
        const errors: ValidationError[] = await validate(dto);
        
        if (errors.length > 0) {
            //Get the errors and push to custom array
            let validationErrors = errors.map(obj => Object.values(obj.constraints));
            throw new HttpException(`Validation failed with following Errors: ${validationErrors}`, HttpStatus.BAD_REQUEST);
        }
    
        // return header dto object
        return dto;
    },
)
