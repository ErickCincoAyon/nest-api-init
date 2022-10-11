import { applyDecorators, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserRoleGuard } from '../guards/user-role.guard';
import { ValidRoles } from '../interfaces/valid-roles.enum';
import { RoleProtected } from './role-protected.decorator';

/**
 * 
 * @param roles this is the param to get the valid roles from an enum create
 *              previously and send to RoleProtected to inject in the Metadata,
 * 
 * @returns a true or forbidden access.
 * * UseGuards, use the AuthGuard() from passport to inject the user from the request and
 * * validate the roles of user with the roles that was injected in the metadata with RoleProtected()
 */
export function Auth(...roles: ValidRoles[]) {
  return applyDecorators(
    RoleProtected(...roles),
    UseGuards( AuthGuard(), UserRoleGuard ),
  );

}