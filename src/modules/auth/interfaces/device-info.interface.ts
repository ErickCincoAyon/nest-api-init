import { IGeo } from "./geo.interface";

export interface IDeviceInfo {
    os: string;
    client: string;
    device: string;
    from: IGeo;
}