/// <reference types="node" />
import { EventEmitter } from 'events';
import { kHS, kConns, kSocket, kState, kServer, kIntervalCheck } from './internal/symbol';
import { ConnectionID } from './internal/protocol';
import { SourceToken } from './internal/crypto';
import { Socket, AddressInfo } from './socket';
import { ServerHandShake, ServerConfig } from './handshake';
import { Session } from './session';
export declare class ServerSession extends Session {
    [kHS]: ServerHandShake;
    [kServer]: Server;
    constructor(id: ConnectionID, socket: Socket<ServerSession>, server: Server);
    readonly server: Server;
}
export declare class ServerState {
    destroyed: boolean;
    scfg: ServerConfig;
    sourceToken: SourceToken;
    constructor();
}
export declare interface Server {
    addListener(event: "error", listener: (err: Error) => void): this;
    addListener(event: "close", listener: (err?: Error) => void): this;
    addListener(event: "listening", listener: () => void): this;
    addListener(event: "session", listener: (session: Session) => void): this;
    emit(event: "error", err: Error): boolean;
    emit(event: "close", err?: Error): boolean;
    emit(event: "listening"): boolean;
    emit(event: "session", session: Session): boolean;
    on(event: "error", listener: (err: Error) => void): this;
    on(event: "close", listener: (err?: Error) => void): this;
    on(event: "listening", listener: () => void): this;
    on(event: "session", listener: (session: Session) => void): this;
    once(event: "error", listener: (err: Error) => void): this;
    once(event: "close", listener: (err?: Error) => void): this;
    once(event: "listening", listener: () => void): this;
    once(event: "session", listener: (session: Session) => void): this;
}
export declare class Server extends EventEmitter {
    [kSocket]: Socket<ServerSession> | null;
    [kState]: ServerState;
    localFamily: string;
    localAddress: string;
    localPort: number;
    listening: boolean;
    private [kConns];
    private [kIntervalCheck];
    constructor();
    address(): AddressInfo;
    listen(port: number, address?: string): Promise<{}>;
    _intervalCheck(time: number): void;
    shutdown(_timeout: number): Promise<void>;
    close(err?: any): Promise<void>;
    getConnections(): Promise<number>;
    ref(): void;
    unref(): void;
}
