import { createParamDecorator, ExecutionContext, InternalServerErrorException } from '@nestjs/common';
import { User } from 'src/user/entities/user.entity';


/**
 * @params prop is the property of document to get the specific 
 *         value of the property, for example:
 *         - @GetUser('email') will return the email of user
 */
export const GetUser = createParamDecorator(
    ( prop: string, ctx: ExecutionContext ) => {

        const req = ctx.switchToHttp().getRequest();
        const user = req.user as User;

        if ( !user )
            throw new InternalServerErrorException('User not found (request)');
        
        return ( !prop ) 
            ? user 
            : user[prop];
        
    }
);