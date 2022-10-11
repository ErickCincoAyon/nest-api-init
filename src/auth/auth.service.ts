import { Injectable, UnauthorizedException, Logger, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { JwtService } from '@nestjs/jwt';
import { IJwtPayload } from './interfaces/jwt-payload.interface';
import { LoginUserDto } from './dto/login-user.dto';
import { User } from '../user/entities/user.entity';
import * as argon2 from "argon2";
import { ILoginResponse } from './interfaces/login-response.interface';
import { IUser } from './interfaces/user.interface';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { AuthcodeService } from './authcode.service';
import { AUTHCODE_TYPES } from './interfaces/authcode-types.enum';
import { VerifyCodeDto } from './dto/verify-code.dto';
import { Authcode } from './entities/authcode.entity';
import { NewPasswordDto } from './dto/new-password.dto';
import { MailService } from 'src/mail/mail.service';
import { IDeviceInfo } from './interfaces/device-info.interface';

@Injectable()
export class AuthService {

  private logger = new Logger('AuthService');

  constructor(
    private readonly authcodeService: AuthcodeService,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) {}
  
  /**
   * * Function to register an user
   * @param createUserDto is the required information to register an user
   * @returns user information and token of the user
   */
  async register( createUserDto: CreateUserDto ): Promise<ILoginResponse> {
    const user = await this.userService.createUserDto( createUserDto );

    return {
      user,
      token: this.getJwtToken({ id: user.id })
    };
  }

  /**
   * * Function to login users
   * @param loginUserDto login method, email or phone with your password
   * @returns user information and token of the user
   */
  async login( loginUserDto: LoginUserDto, deviceInfo: IDeviceInfo ): Promise<ILoginResponse | Object> {

    const { password, email, phone } = loginUserDto;
    let user: User;
    if ( !email ) 
      user = await this.userService.userModel.findOne({ phone }).select('+password');
    
    if ( !phone )
      user = await this.userService.userModel.findOne({ 
        email: { 
          $regex: new RegExp(["^", email, "$"].join(""), "i") 
        } 
      }).select('+password');

    const OAuthOff = await this.checkAccount( user, password );
    if ( OAuthOff )
      return OAuthOff;

    return await this.authcodeService.createAuthcode( user, AUTHCODE_TYPES.accessOauth, deviceInfo );
  }

  /**
   * * Function Two-step authentication, login by a code sent to the email or phone
   * @param verifyCodeDto code to search if exists in authcodes collection
   * @returns user information and token of the user
   */
  async oauthLogin( verifyCodeDto: VerifyCodeDto ): Promise<ILoginResponse> {
    const { code } = verifyCodeDto;
    const authcode = await this.authcodeService.findByFields<Authcode>([
      { field: 'code', value: code, type: 'id' },
      { field: 'type', value: AUTHCODE_TYPES.accessOauth, type: 'id' },
    ]);

    if ( !authcode )
      throw new NotFoundException(`Code: ${ code } has not been found or has expired`);

    const user = await this.userService.findOne<User>( String( authcode.userId ) );
    if ( !user ) {
      this.logger.error('User not found, the record has probably been manually removed from the database')
      throw new InternalServerErrorException(`server error, user with id ${ user._id } not found`);
    }
    
    await this.authcodeService.deleteUserAuthcodes( user._id );
    return await this.userToken( user );
  }

  /**
   * 
   * @param forgotPasswordDto email or phone of users that forgot his password
   * @param deviceInfo come 'os', 'client', 'device' and the location from where the request was made
   * @returns an object to response to the user with the properties ok(boolean), message(string), phone or email 
   *          this depends multifactor_auth of the user, this can be 'phone' or 'email'
   */
  async forgotPassword( forgotPasswordDto: ForgotPasswordDto, deviceInfo: IDeviceInfo ): Promise<Object> {
    const { email, phone } = forgotPasswordDto;
    let user: User;

    if ( email ) {
      user = await this.userService.findByFields([{ field: 'email', value: email }]);
      if ( !user )
        throw new NotFoundException(`User email ${ email } not found`);
    }

    if ( phone ) {
      user = await this.userService.findByFields([{ field: 'phone', value: phone, type: 'number' }]);
      if ( !user )
        throw new NotFoundException(`User phone ${ phone } not found`);
    }

    return await this.authcodeService.createAuthcode( user, AUTHCODE_TYPES.forgotPassword, deviceInfo );
  }

  /**
   * * Function to verify if a code is valid
   * @param verifyCodeDto comes code property to verify if this exists in the database
   * @returns an object with properties: ok(boolean) and message(string)
   */
  async verifyCode( verifyCodeDto: VerifyCodeDto ): Promise<Object> {
    const { code } = verifyCodeDto;

    const authcode = await this.authcodeService.findByFields<Authcode>([{ field: 'code', value: code, type: 'id' }]);
    if ( !authcode )
      throw new NotFoundException(`Code: ${ code } not found`);

    return { ok: true, message: `Code: ${ code } still exists in the database` };
  }

  /**
   * * Function to generate a new password to the user
   * @param newPasswordDto the new password dto 
   * @param deviceInfo come 'os', 'client', 'device' and the location from where the request was made
   * @returns user information and token of the user
   */
  async newPassword( newPasswordDto: NewPasswordDto, deviceInfo: IDeviceInfo ): Promise<ILoginResponse> {
    const { code, password } = newPasswordDto;

    const authcode = await this.authcodeService.findByFields<Authcode>([
      { field: 'code', value: code, type: 'id' },
      { field: 'type', value: AUTHCODE_TYPES.forgotPassword, type: 'id' }
    ]);
    if ( !authcode )
      throw new NotFoundException(`Code: ${ code } not found`);
    
    let user = await this.userService.findOne<User>( String( authcode.userId ) );
    switch ( true ) {
      case !user:
        throw new InternalServerErrorException(`User who created the code has not been found`);
   
      case user.banned:
        throw new UnauthorizedException(`${ user.username }'s account has been banned, talk with an admin`);
          
      case !user.active:
        throw new UnauthorizedException(`${ user.username }'s account has been permanently banned`);

      default:
        break;
    }

    user = await this.userService.newPassword( user._id, password );
    try {
        this.mailService.newPassword( user, deviceInfo, user.multifactor_auth );

      } catch (error) { this.mailService.handleExceptions( error ) };

    await this.authcodeService.deleteUserAuthcodes( user._id );
    return await this.userToken( user );
  }

  /**
   * * Function to return user information and token of the user
   * @param user 
   * @returns user information and token of the user
   */
  async userToken( user: IUser | User ): Promise<ILoginResponse> {
    let loginData: ILoginResponse = {
      user,
      token: this.getJwtToken({ id: user._id })
    };

    return loginData;
  }

  /**
   * * Function to validate if an account can pass
   * @param user 
   * @param password 
   * @returns 
   */
  private async checkAccount( user: User, password: string = undefined ): Promise<ILoginResponse> {

    switch ( true ) {
      case !user || !await this.checkPassword( password, user.password ):
        throw new UnauthorizedException('Credentials are not valid');
   
      case user.banned:
        throw new UnauthorizedException(`${ user.username }'s account has been banned, talk with an admin`);
          
      case !user.active:
        throw new UnauthorizedException(`${ user.username }'s account has been permanently banned`);

      case !user.oauth:
        return await this.userToken( user );

      default:
        return;
    }
  }

  /**
   * * Function to validate if the password sent is the same as the user stored in the database
   * @param password 
   * @param passwordDB 
   * @returns boolean
   */
  private async checkPassword( password: string, passwordDB: string ): Promise<boolean> {
    try {

      if ( await argon2.verify( passwordDB, password ))
        return true;
        
      return false;

    } catch ( error ) {

      this.logger.error( error );
      return false;
    }
  }

  /**
   * * Function to generate JWT
   * @param payload with only id property inside
   * @returns string
   */
  private getJwtToken( payload: IJwtPayload ): string {

    const token = this.jwtService.sign( payload );
    return token;

  }
}
