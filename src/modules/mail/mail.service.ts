import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Authcode } from 'src/modules/auth/entities/authcode.entity';
import { IDeviceInfo } from 'src/modules/auth/interfaces/device-info.interface';
import { MULTIFACTOR_AUTH_TYPES } from 'src/common/enums/multifactor-auth.enum';
import { User } from 'src/modules/user/entities/user.entity';
import { Twilio } from 'twilio';
import { ITwilioSettings } from './interfaces/twilio-settings.interface';

@Injectable()
export class MailService {

    private logger = new Logger('MailService');
    private twilioSettings: ITwilioSettings = this.configService.get('smsService');
    private client: Twilio;

    constructor(
        private readonly configService: ConfigService,
        private readonly mailerService: MailerService
    ) { 
        this.client = new Twilio( this.twilioSettings.accountSid, this.twilioSettings.authToken );
    }

    /**
     * * Function to send message of welcome to the user
     * @param user 
     * @param service is the type mail service, email or phone
     */
    async welcomeUser( user: User, service: MULTIFACTOR_AUTH_TYPES ) {

        try {
            if ( service === 'email' )
            await this.mailerService.sendMail({
                to: user.email, // list of receivers
                subject: `Welcome to the application !`, // Subject line
                template: 'welcome',
                context: {
                    username: user.username,
                },
            });

            if ( service === 'phone' ) {
                const { messagingServiceSid } = this.twilioSettings;

                await this.client.messages.create({
                    messagingServiceSid,
                    to: `+${ user.country_code }${ user.phone }`,
                    body: `Welcome ${ user.username }, your registration in the app has been successful`,
                });
            }

        } catch (error) { this.handleExceptions( error ) }
    }


    /**
     * * Function to send the login code to the user OAuth
     * @param user 
     * @param authcode 
     * @param service 
     */
    async accessOauth( user: User, authcode: Authcode, service: MULTIFACTOR_AUTH_TYPES ) { 

        try {
            const timezone = 'Timezone ' + authcode.deviceInfo.from.timezone.split('/')[0] + ' - ' + authcode.deviceInfo.from.timezone.split('/')[1] || '';

            if ( service === 'email' )
            await this.mailerService.sendMail({
                to: user.email, // list of receivers
                subject: `Two-step authentication, access code generated ${ authcode.code }`, // Subject line
                template: 'access-oauth',
                context: {
                    username: user.username,
                    codeLetter0: authcode.code.split('')[0],
                    codeLetter1: authcode.code.split('')[1],
                    codeLetter2: authcode.code.split('')[2],
                    codeLetter3: authcode.code.split('')[3],
                    codeLetter4: authcode.code.split('')[4],
                    region: authcode.deviceInfo.from.region || '',
                    city: authcode.deviceInfo.from.city || '',
                    country: authcode.deviceInfo.from.country || '',
                    timezone,
                    os: authcode.deviceInfo.os,
                    device: authcode.deviceInfo.device,
                    client: authcode.deviceInfo.client,
                    date: this.getFormattedDate( authcode.createdAt )
                },
            });

            if ( service === 'phone' ) {
                const { messagingServiceSid } = this.twilioSettings;

                await this.client.messages.create({
                    messagingServiceSid,
                    to: `+${ user.country_code }${ user.phone }`,
                    body: `Two-step authentication, access code generated ${ authcode.code }, From ${ ( authcode.deviceInfo.from.region ) && authcode.deviceInfo.from.region }, ${ ( authcode.deviceInfo.from.city ) && authcode.deviceInfo.from.city }, ${ ( authcode.deviceInfo.from.country ) && authcode.deviceInfo.from.country }, ${ ( authcode.deviceInfo.from.timezone ) && timezone }, use this code to change your password. Device info ${ authcode.deviceInfo.os }, ${ authcode.deviceInfo.device }, ${ authcode.deviceInfo.client }, ${ this.getFormattedDate( authcode.createdAt )}`,
                });
            }

        } catch (error) { this.handleExceptions( error ) }
    }

    /**
     * * Function to send a code to create a new password
     * @param user 
     * @param authcode 
     * @param service 
     */
    async forgotPassword( user: User, authcode: Authcode, service: MULTIFACTOR_AUTH_TYPES ) {

        try {
            const timezone = 'Timezone ' + authcode.deviceInfo.from.timezone.split('/')[0] + ' - ' + authcode.deviceInfo.from.timezone.split('/')[1] || '';

            if ( service === 'email' ) 
            await this.mailerService.sendMail({
                to: user.email, // list of receivers
                subject: `Created authentication code: ${ authcode.code }, use this code to change your password`, // Subject line
                template: 'forgot-password',
                context: {
                    username: user.username,
                    codeLetter0: authcode.code.split('')[0],
                    codeLetter1: authcode.code.split('')[1],
                    codeLetter2: authcode.code.split('')[2],
                    codeLetter3: authcode.code.split('')[3],
                    codeLetter4: authcode.code.split('')[4],
                    region: authcode.deviceInfo.from.region || '',
                    city: authcode.deviceInfo.from.city || '',
                    country: authcode.deviceInfo.from.country || '',
                    timezone,
                    os: authcode.deviceInfo.os,
                    device: authcode.deviceInfo.device,
                    client: authcode.deviceInfo.client,
                    date: this.getFormattedDate( authcode.createdAt )
                },
            });

            if ( service === 'phone' ) {
                const { messagingServiceSid } = this.twilioSettings;

                await this.client.messages.create({
                    messagingServiceSid,
                    to: `+${ user.country_code }${ user.phone }`,
                    body: `Forgot password, restore code ${ authcode.code }, From ${ ( authcode.deviceInfo.from.region ) && authcode.deviceInfo.from.region }, ${ ( authcode.deviceInfo.from.city ) && authcode.deviceInfo.from.city }, ${ ( authcode.deviceInfo.from.country ) && authcode.deviceInfo.from.country }, ${ ( authcode.deviceInfo.from.timezone ) && timezone }, use this code to change your password. Device info ${ authcode.deviceInfo.os }, ${ authcode.deviceInfo.device }, ${ authcode.deviceInfo.client }, ${ this.getFormattedDate( authcode.createdAt )}`,
                });
            }
        } catch (error) { this.handleExceptions( error ) }
        
    }

    /**
     * * Function to send a message that user's password was reset
     * @param user 
     * @param deviceInfo 
     * @param service 
     */
    async newPassword( user: User, deviceInfo: IDeviceInfo, service: MULTIFACTOR_AUTH_TYPES ) {

        try {
            const timezone = 'Timezone ' + deviceInfo.from.timezone.split('/')[0] + ' - ' + deviceInfo.from.timezone.split('/')[1] || '';

            if ( service === 'email' )
                await this.mailerService.sendMail({
                    to: user.email, // list of receivers
                    subject: `Password restore successfully`, // Subject line
                    template: 'new-password',
                    context: {
                        username: user.username,
                        region: deviceInfo.from.region || '',
                        city: deviceInfo.from.city || '',
                        country: deviceInfo.from.country || '',
                        timezone,
                        os: deviceInfo.os,
                        device: deviceInfo.device,
                        client: deviceInfo.client,
                        date: this.getFormattedDate( new Date() )
                    },
                });
    
            if ( service === 'phone' ) {
                const { messagingServiceSid } = this.twilioSettings;
    
                await this.client.messages.create({
                    messagingServiceSid,
                    to: `+${ user.country_code }${ user.phone }`,
                    body: `New password generated, From ${ ( deviceInfo.from.region ) && deviceInfo.from.region }, ${ ( deviceInfo.from.city ) && deviceInfo.from.city }, ${ ( deviceInfo.from.country ) && deviceInfo.from.country }, ${ ( deviceInfo.from.timezone ) && timezone }, Device info ${ deviceInfo.os }, ${ deviceInfo.device }, ${ deviceInfo.client }, ${ this.getFormattedDate( new Date() )}`,
                });
            }

         } catch (error) { this.handleExceptions( error ) }
    }

    /**
     * * Function to send a message that user's password was reset
     * @param user 
     * @param deviceInfo 
     * @param service 
     */
    async verifyAccount( user: User, authcode: Authcode, service: MULTIFACTOR_AUTH_TYPES ) { 
        
    }

    /**
     * * Function to format the date, example: '2022-10-05 19:55:26'
     * @param date 
     * @returns 
     */
    private getFormattedDate( date: Date ): string {

        let month = ("0" + (date.getMonth() + 1)).slice(-2);
        let day  = ("0" + (date.getDate())).slice(-2);
        let year = date.getFullYear();
        let hour =  ("0" + (date.getHours())).slice(-2);
        let min =  ("0" + (date.getMinutes())).slice(-2);
        let seg = ("0" + (date.getSeconds())).slice(-2);

        return year + "-" + month + "-" + day + " " + hour + ":" +  min + ":" + seg;
    }

    /**
     * * Function to handle the errors 
     * @param error 
     */
    async handleExceptions( error: any ): Promise<void> {
        this.logger.error( error );
    }
}
