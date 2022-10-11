import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';
import { BadRequestException } from '@nestjs/common';

/**
 * * This is a decorator to use in DTOs
 * @param validationOptions 
 * @returns true or the bad request
 */
export function NewPasswordValidation( validationOptions?: ValidationOptions ) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'newPasswordValidation',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {

            let newPasswordDto: any = { ...args.object };
            if ( newPasswordDto.password !== newPasswordDto.repeatPassword )
              throw new BadRequestException(`Passwords must be the same`);

            return true;
        },
      },
    });
  };
}