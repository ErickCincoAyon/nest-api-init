import { SetMetadata } from '@nestjs/common';
import { ValidRoles } from '../interfaces/valid-roles.enum';


/**
 * @param META_ROLES is the name of the property injected in the context with the
 *                   args in this case the ValidRoles[] 
 * 
 * * If we want to get this metadata in this case 'roles' we should get whit Reflector
 * * const validRoles: string[] = this.reflector.get( META_ROLES , context.getHandler() )
 * * where META_ROLES is 'roles', we are using the export const that we create previously
 *      
 */
export const META_ROLES = 'roles';
export const RoleProtected = (...args: ValidRoles[] ) => {


    return SetMetadata( META_ROLES , args);
}
