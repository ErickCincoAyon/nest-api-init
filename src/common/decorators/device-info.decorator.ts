import { createParamDecorator, ExecutionContext, Logger, BadRequestException } from '@nestjs/common';
import * as geoip from 'geoip-lite';
import * as requestIp from '@supercharge/request-ip';
import { IDeviceInfo } from 'src/auth/interfaces/device-info.interface';
const DeviceDetector = require('node-device-detector');


/**
 * * Decorator to get user agent to get device info
 */
export const DeviceInfo = createParamDecorator(
    async ( data: string, ctx: ExecutionContext ) => {

        const req = ctx.switchToHttp().getRequest();
        const userAgent = req.headers['user-agent'];
        let ip = requestIp.getClientIp(req);

        if ( ip === '::1' ) 
            ip = '46.137.79.134';

        if ( !userAgent )
            throw new BadRequestException('User agent not found (headers["user-agent"])');
        
        let deviceInfo: IDeviceInfo;
        const logger: Logger = new Logger('Device Information')
        const detector = new DeviceDetector({
            clientIndexes: true,
            deviceIndexes: true,
            deviceAliasCode: false,
        });
        
        try {
            const { range, country, region, timezone, city } = await geoip.lookup( ip );
            const { os, client, device } = await detector.detect( userAgent );

            return deviceInfo = {
                os: `${ os.name } ${ os.version }`,
                client: `${ client.type.charAt(0).toUpperCase() + client.type.slice(1) } ${ client.name } ${ client.version }`,
                device: ( device.type === 'desktop' ) ? `${ device.type.charAt(0).toUpperCase() + device.type.slice(1) } PC` :
                    `${ device.type.charAt(0).toUpperCase() + device.type.slice(1) } ${ device.model } ${ device.brand }`,
                from: { range, country, region, timezone, city },
            }
        } catch (error) {
            logger.error( error );
            throw new BadRequestException('Required fields "IP" and "User-Agent" must be in request');
        }
    }
);