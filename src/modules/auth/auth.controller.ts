import { Controller, Get, Post, Body, Patch } from '@nestjs/common';
import { CreateUserDto } from 'src/modules/user/dto/create-user.dto';
import { AuthService } from './auth.service';
import { Auth } from './decorators/auth.decorator';
import { GetUser } from './decorators/get-user.decorator';
import { LoginUserDto } from './dto/login-user.dto';
import { IUser } from './interfaces/user.interface';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { VerifyCodeDto } from './dto/verify-code.dto';
import { NewPasswordDto } from './dto/new-password.dto';
import { DeviceInfo } from 'src/common/decorators/device-info.decorator';
import { IDeviceInfo } from './interfaces/device-info.interface';

@Controller('auth')
export class AuthController {

  constructor(
    private readonly authService: AuthService
  ) {}

  @Post('register')
  async register( @Body() createUserDto: CreateUserDto ) {
    return this.authService.register( createUserDto );
  }

  @Post('login')
  async login( @Body() loginUserDto: LoginUserDto, @DeviceInfo() deviceInfo: IDeviceInfo ) {
    return this.authService.login( loginUserDto, deviceInfo );
  }

  @Post('oauth-login')
  async oauthLogin( @Body() verifyCodeDto: VerifyCodeDto ) {
    return this.authService.oauthLogin( verifyCodeDto );
  }

  @Post('resend-code')
  async resendCode( @Body() resendCodeDto: VerifyCodeDto, @DeviceInfo() deviceInfo: IDeviceInfo ) {
    return this.authService.resendCode( resendCodeDto, deviceInfo );
  }

  @Post('forgot-password')
  async forgotPassword( @Body() forgotPasswordDto: ForgotPasswordDto, @DeviceInfo() deviceInfo: IDeviceInfo ) {
    return this.authService.forgotPassword( forgotPasswordDto, deviceInfo );
  }

  @Post('verify-code')
  async verifyCode( @Body() verifyCodeDto: VerifyCodeDto ) {
    return this.authService.verifyCode( verifyCodeDto );
  }

  @Patch('new-password')
  async newPassword( @Body() newPasswordDto: NewPasswordDto, @DeviceInfo() deviceInfo: IDeviceInfo ) {
    return this.authService.newPassword( newPasswordDto, deviceInfo );
  }

  @Get('check-status')
  @Auth()
  async checkAuthStatus( @GetUser() user: IUser ) {
    return this.authService.userToken( user );
  }
}