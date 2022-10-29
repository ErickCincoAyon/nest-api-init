import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';
import { BadRequestException } from '@nestjs/common';
import { ForgotPasswordDto } from '../dto/forgot-password.dto';

/**
 * * This is a decorator to use in DTOs
 * @param validationOptions 
 * @returns true or the bad request
 */
export function ForgotPasswordValidation( validationOptions?: ValidationOptions ) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'forgotPasswordValidation',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          
            let userProps: ForgotPasswordDto = { ...args.object };

            if ( !userProps.email && !userProps.phone ) 
              throw new BadRequestException(
                `One of the following properties must be sent 'email' (must be an email) or 
                'phone' (must be a number)`
              );

            return true;
        },
      },
    });
  };
}