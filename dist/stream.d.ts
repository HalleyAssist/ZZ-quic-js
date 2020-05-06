/// <reference types="node" />
import { Duplex } from 'stream';
import { Offset, StreamID } from './internal/protocol';
import { Frame, StreamFrame, RstStreamFrame } from './internal/frame';
import { ConnectionFlowController } from './internal/flowcontrol';
import { RTTStats } from './internal/congestion';
import { Packet, RegularPacket } from './internal/packet';
import { kID, kFC, kVersion, kSession, kState, kRTT } from './internal/symbol';
export interface SessionRef {
    id: string;
    isClient: boolean;
    [kVersion]: string;
    [kFC]: ConnectionFlowController;
    [kRTT]: RTTStats;
    _stateMaxPacketSize: number;
    request(options?: any): Stream;
    _stateDecreaseStreamCount(): void;
    _sendFrame(frame: Frame, callback?: (...args: any[]) => void): void;
    _sendWindowUpdate(offset: Offset, streamID?: StreamID): void;
    _newRegularPacket(): RegularPacket;
    _sendPacket(packet: Packet, callback?: (...args: any[]) => void): void;
}
export declare class Stream extends Duplex {
    private [kID];
    private [kSession];
    private [kState];
    private [kFC];
    constructor(streamID: StreamID, session: SessionRef, options: any);
    readonly id: number;
    readonly aborted: boolean;
    readonly destroyed: boolean;
    readonly bytesRead: number;
    readonly bytesWritten: number;
    readonly closing: boolean;
    close(err: any, callback?: Function): Promise<any>;
    _write(chunk: Buffer, encoding: string, callback: (...args: any[]) => void): void;
    _writev(chunks: any[], callback: (...args: any[]) => void): void;
    _final(callback: (...args: any[]) => void): void;
    _read(size?: number): void;
    _destroy(err: any, callback: (...args: any[]) => void): void;
    _sendBlockFrame(): void;
    _trySendUpdateWindow(): void;
    _handleFrame(frame: StreamFrame, rcvTime: number): void;
    _handleRstFrame(frame: RstStreamFrame, rcvTime: number): void;
    _tryFlushCallbacks(): void;
    private _isRemoteWriteable;
    private _flushData;
}
