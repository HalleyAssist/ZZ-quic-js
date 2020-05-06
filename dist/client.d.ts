import { QUICError } from './internal/error';
import { kHS, kClientState } from './internal/symbol';
import { ClientHandShake } from './handshake';
import { Session } from './session';
import { Stream } from './stream';
export declare interface Client {
    addListener(event: "error", listener: (err: Error) => void): this;
    addListener(event: "goaway", listener: (err: QUICError) => void): this;
    addListener(event: "close", listener: (err?: Error) => void): this;
    addListener(event: "timeout" | "connect", listener: () => void): this;
    addListener(event: "stream", listener: (stream: Stream) => void): this;
    addListener(event: "version", listener: (ver: string) => void): this;
    emit(event: "error", err: Error): boolean;
    emit(event: "goaway", err: QUICError): boolean;
    emit(event: "close", err?: Error): boolean;
    emit(event: "timeout" | "connect"): boolean;
    emit(event: "stream", stream: Stream): boolean;
    emit(event: "version", ver: string): boolean;
    on(event: "error", listener: (err: Error) => void): this;
    on(event: "goaway", listener: (err: QUICError) => void): this;
    on(event: "close", listener: (err?: Error) => void): this;
    on(event: "timeout" | "connect", listener: () => void): this;
    on(event: "stream", listener: (stream: Stream) => void): this;
    on(event: "version", listener: (ver: string) => void): this;
    once(event: "error", listener: (err: Error) => void): this;
    once(event: "goaway", listener: (err: QUICError) => void): this;
    once(event: "close", listener: (err?: Error) => void): this;
    once(event: "timeout" | "connect", listener: () => void): this;
    once(event: "stream", listener: (stream: Stream) => void): this;
    once(event: "version", listener: (ver: string) => void): this;
}
export declare class Client extends Session {
    [kClientState]: ClientState;
    [kHS]: ClientHandShake;
    constructor();
    _resendPacketsForNegotiation(): void;
    setKeepAlive(enable: boolean, _initialDelay?: number): void;
    ref(): void;
    unref(): void;
    spawn(port: number, address?: string): Promise<Client>;
    connect(port: number, address?: string): Promise<void>;
}
export declare class ClientState {
    hostname: string;
    receivedNegotiationPacket: boolean;
    constructor();
}
