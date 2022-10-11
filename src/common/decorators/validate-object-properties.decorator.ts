import { Transform } from 'class-transformer';
import { BadRequestException } from '@nestjs/common';
import { IFieldQueryValidation } from '../interfaces/field-validation.interface';

/**
 * * This is a decorator to use in DTOs
 * @param props of type IFieldQueryValidation[]
 * @returns object property values --> transformed from queryParams ('strings') to number,
 *          boolean, mongo-regex-contains, mongo-regex-exact && string .trim(), 
 */
const ValidateObjectProps = ( props: IFieldQueryValidation[] ) => {
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
        return validateProperties( obj[key], props, key );
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

const validateProperties = ( obj: any, props: IFieldQueryValidation[], key: string ) => {
  let objFormatted = {};
  for ( let p in obj ) {
    props.map(( prop: IFieldQueryValidation ) => {

      if ( p === prop.field && prop.type === 'number' ) {
        obj[p] = +obj[p];
        if ( isNaN( obj[p] ) || obj[p] < 1 )
          throw new BadRequestException(`${ key }[${ p }] must be a positive number`);
      }

      if ( p === prop.field && prop.type === 'sort' ) {
        obj[p] = +obj[p];
        if ( isNaN( obj[p] ) || ( obj[p] < -1 || obj[p] > 1 ) || obj[p] === 0 )
          throw new BadRequestException(`${ key }[${ p }] must be -1 or +1 number`);
        obj[p] = { _id: obj[p] };
      }

      if ( p === prop.field && prop.type === 'boolean' ) {
        if ( ['true', 'on', 'yes', '1'].includes( obj[p] )) {
          obj[p] = true;
        }

        if ( ['false', 'off', 'no', '0'].includes( obj[p] )) {
          obj[p] = false;
        }

        if ( typeof obj[p] !== 'boolean' )
          throw new BadRequestException(`${ key }[${ p }] must be: ['true', 'on', 'yes', '1'] or ['false', 'off', 'no', '0']`);
      }


      if ( p === prop.field && prop.type === 'mongo-regex-exact' ) {
        if ( obj[p].trim() === '' )
          throw new BadRequestException(`${ key }[${ p }] must be longer than or equal to 1 characters`);
        
        obj[p] = new RegExp(["^", obj[p].replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&'), "$"].join(""), "i");
      }

      if ( p === prop.field && prop.type === 'mongo-regex-contains' ) {
        if ( obj[p].trim() === '' )
          throw new BadRequestException(`${ key }[${ p }] must be longer than or equal to 1 characters`);
        
        obj[p] = new RegExp( obj[p].replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&"), 'gi');
      }

      if ( p === prop.field && prop.type === 'string' ) {
        if ( obj[p].trim() === '' )
          throw new BadRequestException(`${ key }[${ p }] must be longer than or equal to 1 characters`);
      }

    })  
    objFormatted[p] = obj[p];
  }
  return objFormatted;
};

export { ValidateObjectProps };