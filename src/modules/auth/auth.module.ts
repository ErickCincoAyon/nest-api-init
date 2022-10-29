import { forwardRef, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from 'src/modules/user/user.module';
import { JwtStrategy } from './strategies/jwt.strategy';
import { AuthcodeService } from './authcode.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Authcode, AuthcodeSchema } from './entities/authcode.entity';

@Module({
  imports: [
    ConfigModule,
    forwardRef(() => UserModule),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ ConfigModule ],
      inject: [ ConfigService ],
      useFactory: ( configService: ConfigService ) => {
        return {
          secret: configService.get('JWT_SECRET'),
          signOptions: {
            expiresIn: configService.get('JWT_EXPIRES_IN')
          }
        }
      }
    }),
    MongooseModule.forFeatureAsync([
      { name: Authcode.name, useFactory: () => ( AuthcodeSchema )},
    ]),
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthcodeService, JwtStrategy],
  exports: [AuthService, AuthcodeService, JwtStrategy, PassportModule, JwtModule]
})
export class AuthModule {}
