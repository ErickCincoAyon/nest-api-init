import { forwardRef, Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './entities/user.entity';
import { FileModule } from 'src/modules/file/file.module';
import { AuthModule } from 'src/modules/auth/auth.module';
import { MailModule } from 'src/modules/mail/mail.module';

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
