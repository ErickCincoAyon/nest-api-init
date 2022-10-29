import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Date, Document } from 'mongoose';
import * as mongoosePaginate from 'mongoose-paginate-v2';
import { MULTIFACTOR_AUTH_TYPES } from 'src/common/enums/multifactor-auth.enum';
import { USER_GENDER_TYPES } from '../enums/user-gender-types.enum';

/**
 * 
 * @param timestamp -> set the dates for default from mongo, adding: createdAt and updatedAt
 * @param collation -> search in the document insesitive cases for duplicity not caring about uppercase and lowercase
 */
@Schema({ timestamps: true, collation: { locale: 'en', strength: 2 }})
export class User extends Document {

    @Prop({ type: String, required: true })
    uuid: string;

    @Prop({ type: String, unique: true, required: true, index: true })
    username: string;

    @Prop({ type: String, unique: true, index: true, sparse: true, trim: true })
    email?: string;

    @Prop({ type: Number, trim: true })
    country_code?: number;

    @Prop({ type: Number, trim: true, unique: true, index: true, sparse: true })
    phone?: number;

    @Prop({ type: String, required: true, trim: true, select: false })
    password: string;

    @Prop({ type: String, trim: true })
    name?: string;

    @Prop({ type: Object, trim: true })
    surname?: string;

    @Prop({ type: String, trim: true, enum: USER_GENDER_TYPES,})
    gender?: USER_GENDER_TYPES;

    @Prop({ type: String, trim: true })
    bio?: string;

    @Prop({ type: Array, trim: true })
    avatar?: string[];

    @Prop({ type: Array, trim: true })
    background?: string[];;

    @Prop({ type: Array, trim: true, default: ['user'] })
    roles?: string[];

    @Prop({ type: Boolean, trim: true, default: false })
    banned: boolean;

    @Prop({ type: Date, trim: true })
    banned_until?: Date;

    @Prop({ type: Boolean, trim: true, default: false, required: true })
    online: boolean;

    @Prop({ type: String, trim: true, enum: MULTIFACTOR_AUTH_TYPES, required: true })
    multifactor_auth: MULTIFACTOR_AUTH_TYPES;

    @Prop({ type: Boolean, trim: true, default: false, required: true })
    oauth: boolean;

    @Prop({ type: Boolean, trim: true, default: true, required: true })
    active: boolean;

    @Prop({ type: String, trim: true, select: false })
    __v: string;
}

export const UserSchema = SchemaFactory.createForClass( User );
UserSchema.plugin( mongoosePaginate );

/**
 * * Function to don't send the 'password' and '__v' after .save();
 */
UserSchema.set( 'toJSON', {
    transform: function( doc, ret, opt ) {
        delete ret['password']
        delete ret['__v']
        return ret
    }
})