import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';
import { BadRequestException } from '@nestjs/common';

/**
 * * This is a decorator to use in DTOs
 * @param validationOptions 
 * @returns true or the bad request
 */
export function UserCreateValidation( validationOptions?: ValidationOptions ) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'userCreateValidation',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
            
            let userProps: any = { ...args.object };
            switch ( true ) {
                case value === 'email':
                    if ( !userProps.email )
                        throw new BadRequestException(`in {"signup_type": "${ value }"}, email must be sent`);
                    if ( userProps.phone || userProps.country_code )
                        throw new BadRequestException(
                            `property ${( userProps.phone ) ? `phone` : 'country_code' } should not exist`
                        );

                    break;

                case value === 'phone':
                    if ( !userProps.phone || !userProps.country_code )
                        throw new BadRequestException(
                            `in {"signup_type": "${ value }"}, ${( !userProps.phone ) ? `phone` : `country_code` } must be sent`
                        );         
                    if ( userProps.email )
                        throw new BadRequestException(`property email should not exist`);

                    break;

                default: return true;
            }

            return true;
        },
      },
    });
  };
}