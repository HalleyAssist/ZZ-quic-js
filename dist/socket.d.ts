/// <reference types="node" />
import { Socket as UDPSocket } from 'dgram';
import { kState } from './internal/symbol';
import { Packet } from './internal/packet';
export { AddressInfo } from 'net';
export interface Socket<T> extends UDPSocket {
    [kState]: SocketState<T>;
    sendPacket(packet: Packet, remotePort: number, remoteAddr: string, callback: (err: any) => void): void;
}
export declare class SocketState<T> {
    exclusive: boolean;
    destroyed: boolean;
    conns: Map<string, T>;
    constructor();
}
export declare function createSocket<T>(family: number): Socket<T>;
