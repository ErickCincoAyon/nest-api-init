import { Transform } from 'class-transformer';
import { BadRequestException } from '@nestjs/common';

/**
 * * This is a decorator to use in DTOs
 * @returns a boolean value from ['true', 'on', 'yes', '1'] return true
 *          and for ['false', 'off', 'no', '0'] return false
 */
export const TransformToBoolean = () => {
  const toPlain = Transform(
    ({ value }) => {
      return value;
    },
    {
      toPlainOnly: true,
    }
  );
  const toClass = (target: any, key: string) => {
    return Transform(
      ({ obj }) => {
        return valueToBoolean(obj[key], key);
      },
      {
        toClassOnly: true,
      }
    )(target, key);
  };
  return function (target: any, key: string) {
    toPlain(target, key);
    toClass(target, key);
  };
};

const valueToBoolean = (value: any, key: string) => {
  if ( typeof value === 'boolean' ) return value;
  if ( typeof value === 'number' )
    throw new BadRequestException(`${ key } must be: ['true', 'on', 'yes', '1'] or ['false', 'off', 'no', '0']`);

  if (['true', 'on', 'yes', '1'].includes(value.toLowerCase())) {
    return true;
  }
  if (['false', 'off', 'no', '0'].includes(value.toLowerCase())) {
    return false;
  }
  throw new BadRequestException(`${ key } must be: ['true', 'on', 'yes', '1'] or ['false', 'off', 'no', '0']`);
};