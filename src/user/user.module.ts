import { forwardRef, Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './entities/user.entity';
import { FileModule } from 'src/file/file.module';
import { AuthModule } from 'src/auth/auth.module';
import { MailModule } from 'src/mail/mail.module';

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      { name: User.name, useFactory: () => ( UserSchema )},
    ]),
    forwardRef(() => AuthModule),
    MailModule,
    FileModule,
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService, MongooseModule, MailModule],
})
export class UserModule {}
