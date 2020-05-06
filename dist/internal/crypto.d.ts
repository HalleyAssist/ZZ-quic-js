/// <reference types="node" />
export declare function fnv1a64Hash(data: Buffer): Buffer;
export declare class SecureContext {
}
export declare class SourceToken {
    private key;
    constructor();
    encode(ip: string): Buffer;
    decode(buf: Buffer): {
        ip: string;
        ts: Date;
    };
}
