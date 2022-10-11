import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { PassportStrategy } from '@nestjs/passport';
import { PaginateModel } from 'mongoose';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { User } from 'src/user/entities/user.entity';
import { IJwtPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy( Strategy ) {

    constructor(
        @InjectModel( User.name )
        private readonly userModel: PaginateModel<User>,
        configService: ConfigService
    ) {

        super({
            secretOrKey: configService.get('JWT_SECRET'),
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        });
    }


    async validate( payload: IJwtPayload ): Promise<User> {
        
        const { id } = payload;
        
        const user = await this.userModel.findById( id );

        if ( !user ) 
            throw new UnauthorizedException('Token has expired')
            
        if ( user.banned ) 
            throw new UnauthorizedException('User is banned, talk with an admin');

        if ( !user.active ) 
            throw new UnauthorizedException('User is disabled, talk with an admin');

        return user;
    }

}