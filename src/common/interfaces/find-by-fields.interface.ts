import { Types } from "mongoose";

export interface IField {
    field: string;
    value: string | boolean | Types.ObjectId | number;
    type?: string;
}