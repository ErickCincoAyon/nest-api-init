import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';
import { BadRequestException } from '@nestjs/common';
import { UpdateUserDto } from '../dto/update-user.dto';

/**
 * * This is a decorator to use in DTOs
 * @param validationOptions 
 * @returns true or the bad request
 */
export function UserUpdateValidation( validationOptions?: ValidationOptions ) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'userUpdateValidation',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
            
            let userProps: UpdateUserDto = { ...args.object };
            if (( userProps.country_code && !userProps.phone ) || ( !userProps.country_code && userProps.phone ))
                throw new BadRequestException(`properties 'country_code' and 'phone' must be send together`);

            return true;
        },
      },
    });
  };
}