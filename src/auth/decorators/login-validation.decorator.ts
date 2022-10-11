import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';
import { BadRequestException } from '@nestjs/common';

/**
 * * This is a decorator to use in DTOs
 * @param validationOptions 
 * @returns true or the bad request
 */
export function LoginValidation( validationOptions?: ValidationOptions ) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'loginValidation',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {

            if ( ['email', 'phone'].every((key) => key in args.object ))
                throw new BadRequestException(`The following properties cannot be sent simultaneously ['email', 'phone']`);

            return true;
        },
      },
    });
  };
}