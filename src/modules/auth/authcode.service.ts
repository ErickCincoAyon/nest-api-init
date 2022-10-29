import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { PaginateModel, Types } from 'mongoose';
import { GenericService } from 'src/common/providers/generic.service';
import { Authcode } from './entities/authcode.entity';
import { AUTHCODE_TYPES } from './interfaces/authcode-types.enum';
import { User } from '../user/entities/user.entity';
import { MailService } from 'src/modules/mail/mail.service';
import { IDeviceInfo } from './interfaces/device-info.interface';

@Injectable()
export class AuthcodeService extends GenericService {

    constructor(
        @InjectModel( Authcode.name ) readonly authcodeModel: PaginateModel<Authcode>,
        private readonly configService: ConfigService,
        private readonly mailService: MailService,
    ) { 
        super( authcodeModel, configService.get( 'pagination' ), 'AuthcodeService' ) 
    }
    
    /**
     * * Function to create an Authcode
     * @param user 
     * @param type of authcore enum AUTHCODE_TYPES
     * @param deviceInfo come 'os', 'client', 'device' and the location from where the request was made
     * @returns 
     */
    async createAuthcode( user: User, type: AUTHCODE_TYPES, deviceInfo: IDeviceInfo ): Promise<Object> {
        const uniqueCode = await this.generateUniqueCode( user._id, type );
        const authCode: Authcode = await this.create({ userId: user._id, type, code: uniqueCode, deviceInfo });

         /** create resendCode */
         const resendUniqueCode = await this.generateUniqueCode( user._id, type );
         const resendCode: Authcode = await this.create({ userId: user._id, type: AUTHCODE_TYPES.resendCode, code: resendUniqueCode, deviceInfo });

        try {
        
            if ( type === AUTHCODE_TYPES.accessOauth ) 
                await this.mailService.accessOauth( user, authCode, user.multifactor_auth );
            
            if ( type === AUTHCODE_TYPES.forgotPassword )
                await this.mailService.forgotPassword( user, authCode, user.multifactor_auth );

            if ( type === AUTHCODE_TYPES.verifyAccount ) 
                await this.mailService.verifyAccount( user, authCode, user.multifactor_auth );

        } catch (error) { 

            this.mailService.handleExceptions( error );
            throw new InternalServerErrorException(`Server error, can't send authenticactión code, talk with an admin`);

        };

        if ( user.multifactor_auth === 'email' )
            return { 
                ok: true, 
                message: `created authentication code, send to email address: ${ user.email.substring(0,3) }*****@${ user.email.split('@')[1] }, after five minutes code will disappear`,
                email: `${ user.email.substring(0,3) }*****@${ user.email.split('@')[1] }`,
                resendCode: resendCode.code,
            };

        if ( user.multifactor_auth === 'phone' )
            return { 
                ok: true, 
                message: `created authentication code, send to phone number: ********${ String( user.phone ).slice(-2) }, after five minutes code will disappear`,
                phone: `********${ String( user.phone ).slice(-2) }`,
                resendCode: resendCode.code,
            };
    }

    /**
     * * Function to create an unique code, if this exists will be create another untill this doesn't
     * * exists in the database to be unique.
     * @param userId 
     * @param type of authcore enum AUTHCODE_TYPES
     * @returns a string code of 5 characters
     */
    async generateUniqueCode( userId: Types.ObjectId, type: AUTHCODE_TYPES ): Promise<string> {

        let codeCreated = await this.generateRandomCode( 5 );

        const recursive = async ( userId: Types.ObjectId, code: string ) => {
            let codeFound = await this.findByFields<Authcode>([
                { field: 'code', value: code, type: 'id' },
                { field: 'type', value: type, type: 'id' },
            ]);

            if ( codeFound ) {
                codeCreated = await this.generateRandomCode( 5 );
                await recursive( userId, codeCreated );
            } else {
                return;
            }
        }

        await recursive( userId, codeCreated );

        return codeCreated;
    }

    /**
     * * Function to generate a randome code with 5 characters
     * @param length 
     * @returns code of 5 characters
     */
    async generateRandomCode( length: number ): Promise<string> {
        let code: string = '';
        let characters: string = 'QWERTYUIOPASDFGHJKLZXCVBNM0123456789';
        let charactersLength = characters.length;

        for ( let i = 0; i < length; i++ ) {
            code += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        
        return code;
    }

    /**
     * * Function to delete all authcodes by user
     * @param user 
     * @returns boolean
     */
    async deleteUserAuthcodes( userId: string ): Promise<boolean> {
        const authcodes = await this.authcodeModel.deleteMany({ userId });
        
        if ( !authcodes ) return false;
        return true;
    }
}
