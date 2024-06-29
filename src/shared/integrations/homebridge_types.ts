export interface IHomebridgeAPIPingResponse {
    status: string;
}

export interface IHomebridgeAPIAccessoryResponse {
    aid: number;
    iid: number;
    uuid: string;
    type: string;
    humanType: string;
    serviceName: string;
    serviceCharacteristics: IHomebridgeAPICharacteristic[];
    accessoryInformation: IHomebridgeAPIAccessoryInformation;
    values: string[];
    //instance: IHomebridgeAPIInstance;
    uniqueId: string;
}

export interface IHomebridgeAPICharacteristic {
    aid: number;
    iid: number;
    uuid: string;
    type: string;
    serviceType: string;
    serviceName: string;
    description: string;
    value: number;
    format: string;
    perms: string[];
    canRead: boolean;
    canWrite: boolean;
    ev: boolean;
}

export interface IHomebridgeAPIAccessoryInformation {
    manufacturer: string;
    model: string;
    serialNumber: string;
    firmwareRevision: string;
    Name: string;
}



export interface IHomebridgeStatesResponse {
    message: string;
}

export interface IHomebrigeStateResponse {
    message: string;
}
