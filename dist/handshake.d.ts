/// <reference types="node" />
import { EventEmitter } from 'events';
import { Certificate } from '@fidm/x509';
import { QuicTags } from './internal/protocol';
import { BufferVisitor } from './internal/common';
import { RegularPacket } from './internal/packet';
import { kSession } from './internal/symbol';
import { SourceToken } from './internal/crypto';
import { Stream, SessionRef } from './stream';
export declare class SCFGCache extends Map<string, ServerConfig> {
    constructor();
}
export declare class ServerConfig extends QuicTags {
    id: string;
    kexs: string[];
    aead: string[];
    vers: string[];
    orbt: string;
    expy: number;
    pubs: Buffer[];
    cert: Certificate | null;
    constructor(cert: Certificate | null);
    setup(publicKey: Buffer, exp: number): void;
    decodeTags(): void;
    encodeTags(): void;
    byteLen(): number;
    writeTo(bufv: BufferVisitor): BufferVisitor;
}
export declare class HandShake extends EventEmitter {
    state: number;
    completed: boolean;
    [kSession]: SessionRef;
    constructor(session: SessionRef);
    handlePacket(_packet: RegularPacket, _rcvTime: number, _bufv: BufferVisitor): void;
}
export declare class ClientHandShake extends HandShake {
    chlo: QuicTags;
    initStream: Stream;
    constructor(session: SessionRef);
    handlePacket(_packet: RegularPacket, _rcvTime: number, _bufv: BufferVisitor): void;
    setup(): void;
    sendInchoateCHLO(): void;
    sendCHLO(): void;
}
export declare class ServerHandShake extends HandShake {
    scfg: ServerConfig;
    sourceToken: SourceToken;
    sentSHLO: boolean;
    tagSNI: string;
    tagXLCT: Buffer | null;
    tagSCID: string;
    constructor(session: SessionRef, sourceToken: SourceToken, scfg: ServerConfig);
    handlePacket(packet: RegularPacket, _rcvTime: number, bufv: BufferVisitor): void;
    isInchoateCHLO(tags: QuicTags, cert: Buffer): boolean;
    acceptSTK(buf: Buffer | null): boolean;
    sendREJ(): void;
    sendSHLO(): void;
}
