import { Transform } from 'class-transformer';
import { BadRequestException, InternalServerErrorException } from '@nestjs/common';


/**
 * * This is a decorator to use in DTOs
 * @param type is a string that can be 'mongo-regex-contains' or 'mongo-regex-exact'
 * @returns a RegExp
 */
const TransformToMongoRegex = ( type: string = 'mongo-regex-contains' ) => {
  const toPlain = Transform(
    ({ value }) => {
      return value;
    },
    {
      toPlainOnly: true,
    }
  );
  const toClass = ( target: any, key: string ) => {
    return Transform(
      ({ obj }) => {
        return valueToRegex( obj[key], key, type );
      },
      {
        toClassOnly: true,
      }
    )(target, key);
  };
  return function ( target: any, key: string ) {
    toPlain( target, key );
    toClass( target, key );
  };
};

const valueToRegex = ( value: any, key: string, type: string ) => {

  if ( !value || value.trim() === '' )
    throw new BadRequestException(`${[ key ]} must be longer than or equal to 1 characters`);
  if ( value && value.trim().length > 29 ) 
    throw new BadRequestException(`${[ key ]} must be shorter than or equal to 30 characters`);

  if ( type === 'mongo-regex-contains' ) return new RegExp( value.trim().replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&"), 'gi');
  if ( type === 'mongo-regex-exact' ) return new RegExp(["^", value.trim().replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&'), "$"].join(""), "i");

  throw new InternalServerErrorException(`type option argument of decorator should be "mongo-regex-contains or mongo-regex-exact"`);
};

export { TransformToMongoRegex };