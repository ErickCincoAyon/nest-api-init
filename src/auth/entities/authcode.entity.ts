import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoosePaginate from 'mongoose-paginate-v2';
import { AUTHCODE_TYPES } from '../interfaces/authcode-types.enum';
import { Types } from 'mongoose';
import { IDeviceInfo } from '../interfaces/device-info.interface';

@Schema({ timestamps: true })
export class Authcode {
    @Prop({ type: Types.ObjectId, trim: true, required: true })
    userId: Types.ObjectId;

    @Prop({ type: String, trim: true, required: true })
    code: string;

    @Prop({ type: String, trim: true, enum: AUTHCODE_TYPES, required: true })
    type: AUTHCODE_TYPES;

    @Prop({ type: Object, required: true })
    deviceInfo: IDeviceInfo;

    @Prop({ type: Date })
    createdAt: Date;
}

export const AuthcodeSchema = SchemaFactory.createForClass( Authcode );
AuthcodeSchema.index({ createdAt: 1 },{ expires: '5m' });
AuthcodeSchema.plugin( mongoosePaginate );

/**
 * * Function to don't send '__v' after .save();
 */
AuthcodeSchema.set( 'toJSON', {
    transform: function( doc, ret, opt ) {
        delete ret['__v']
        return ret
    }
})