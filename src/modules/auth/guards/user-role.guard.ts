import { Reflector } from '@nestjs/core';
import { CanActivate, ExecutionContext, Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { META_ROLES } from '../decorators/role-protected.decorator';
import { User } from '../../user/entities/user.entity';
import { ValidRoles } from '../interfaces/valid-roles.enum';


/**
 * * User Role Guard, this get the validRoles with Reflector
 * * that was injected in the context previously and validate these roles
 * * to acces the endpoint
 */
@Injectable()
export class UserRoleGuard implements CanActivate {
  
  constructor(
    private readonly reflector: Reflector
  ) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    
    const validRoles: string[] = this.reflector.get( META_ROLES , context.getHandler() )
    if ( !validRoles ||  validRoles.length === 0 ) return true;
    
    const req = context.switchToHttp().getRequest();
    const user = req.user as User;

    if ( !user ) 
      throw new BadRequestException('User not found');
    
    if ( validRoles.includes( ValidRoles.owner ) ) {
      const { id } = req.params;

      if ( String( user._id ) !== id && !user.roles.includes( ValidRoles.admin )) 
        throw new ForbiddenException(`${ user.username } does not have the permissions to perform this action`);
      
      return true;
    } else {

      for (const role of user.roles ) {
        if ( validRoles.includes( role ) ) {

          return true;

        }
      }
    }
    
    throw new ForbiddenException(
      `User ${ user.username } need a valid role: [${ validRoles }]`
    );
  }
}
