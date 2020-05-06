'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
// **Github:** https://github.com/fidm/quic
//
// **License:** MIT
// https://docs.google.com/document/d/1g5nIXAIkN_Y-7XJW5K45IblHd_L2f5LTaDUDwvZ5L6g/edit#
const net_1 = require("net");
const crypto_1 = require("crypto");
const events_1 = require("events");
const protocol_1 = require("./internal/protocol");
const common_1 = require("./internal/common");
const frame_1 = require("./internal/frame");
const error_1 = require("./internal/error");
const constant_1 = require("./internal/constant");
const symbol_1 = require("./internal/symbol");
const crypto_2 = require("./internal/crypto");
const ivLen = 12;
class SCFGCache extends Map {
    constructor() {
        super();
    }
}
exports.SCFGCache = SCFGCache;
class ServerConfig extends protocol_1.QuicTags {
    constructor(cert) {
        super(protocol_1.Tag.SCFG);
        this.id = '';
        this.pubs = [];
        this.expy = 0;
        this.orbt = '';
        this.kexs = ['C255']; // Curve25519, P256 not yet implemented
        this.aead = ['AESG']; // AES-GCM with a 12-byte tag and IV. S20P not yet implemented
        this.vers = ['Q039'];
        this.cert = cert;
    }
    setup(publicKey, exp) {
        this.id = crypto_1.randomBytes(16).toString('hex');
        this.pubs = [publicKey]; // 24-bit
        this.expy = exp;
    }
    decodeTags() {
        const id = this.get(protocol_1.Tag.SCID);
        if (id == null || id.length !== 16) {
            throw error_1.QuicError.fromError(error_1.QuicError.QUIC_INVALID_CRYPTO_MESSAGE_TYPE);
        }
        this.id = id.toString('hex');
        const kexs = this.get(protocol_1.Tag.KEXS);
        if (kexs == null || kexs.length < 4) {
            throw error_1.QuicError.fromError(error_1.QuicError.QUIC_INVALID_CRYPTO_MESSAGE_TYPE);
        }
        this.kexs = [kexs.toString('utf8', 0, 4)];
        const aead = this.get(protocol_1.Tag.AEAD);
        if (aead == null || aead.length < 4) {
            throw error_1.QuicError.fromError(error_1.QuicError.QUIC_INVALID_CRYPTO_MESSAGE_TYPE);
        }
        this.aead = [aead.toString('utf8', 0, 4)];
        const vers = this.get(protocol_1.Tag.VER);
        if (vers == null || vers.length < 4) {
            throw error_1.QuicError.fromError(error_1.QuicError.QUIC_INVALID_CRYPTO_MESSAGE_TYPE);
        }
        this.vers = [vers.toString('utf8', 0, 4)];
        const pubs = this.get(protocol_1.Tag.PUBS);
        if (pubs == null || pubs.length < 3) {
            throw error_1.QuicError.fromError(error_1.QuicError.QUIC_INVALID_CRYPTO_MESSAGE_TYPE);
        }
        this.pubs = [pubs.slice(0, 3)];
    }
    encodeTags() {
        return;
    }
    byteLen() {
        this.encodeTags();
        return super.byteLen();
    }
    writeTo(bufv) {
        this.encodeTags();
        return super.writeTo(bufv);
    }
}
exports.ServerConfig = ServerConfig;
class HandShake extends events_1.EventEmitter {
    constructor(session) {
        super();
        this.state = 0;
        this.completed = false;
        this[symbol_1.kSession] = session;
    }
    handlePacket(_packet, _rcvTime, _bufv) {
        throw new Error('Not implemented!');
    }
}
exports.HandShake = HandShake;
class ClientHandShake extends HandShake {
    constructor(session) {
        super(session);
        this.chlo = new protocol_1.QuicTags(protocol_1.Tag.CHLO);
        this.initStream = session.request(); // should be stream 1
    }
    handlePacket(_packet, _rcvTime, _bufv) {
        return;
    }
    setup() {
        this.emit('secureConnection');
        return;
    }
    sendInchoateCHLO() {
        return;
    }
    sendCHLO() {
        return;
    }
}
exports.ClientHandShake = ClientHandShake;
class ServerHandShake extends HandShake {
    constructor(session, sourceToken, scfg) {
        super(session);
        this.scfg = scfg;
        this.sourceToken = sourceToken;
        this.sentSHLO = false;
        this.tagSNI = '';
        this.tagXLCT = null;
        this.tagSCID = '';
    }
    handlePacket(packet, _rcvTime, bufv) {
        if (bufv.length < constant_1.MinInitialPacketSize) {
            throw new error_1.QuicError('QUIC_HANDSHAKE_FAILED');
        }
        bufv.walk(ivLen);
        // const iv = bufv.buf.slice(bufv.start, bufv.end)
        const stream = frame_1.StreamFrame.fromBuffer(bufv);
        if (stream.streamID.valueOf() !== 1 || stream.data == null) {
            throw error_1.QuicError.fromError(error_1.QuicError.QUIC_INVALID_CRYPTO_MESSAGE_TYPE);
        }
        packet.addFrames(stream);
        const tags = protocol_1.QuicTags.fromBuffer(new common_1.BufferVisitor(stream.data));
        if (tags.name !== protocol_1.Tag.CHLO) {
            throw error_1.QuicError.fromError(error_1.QuicError.QUIC_INVALID_CRYPTO_MESSAGE_TYPE);
        }
        if (tags.has(protocol_1.Tag.FHL2)) {
            throw new error_1.QuicError('FHL2 experiment. Unsupported');
        }
        if (tags.has(protocol_1.Tag.NSTP)) {
            throw new error_1.QuicError('NSTP experiment. Unsupported');
        }
        // -------inchoate client hello messages-----
        const pdmd = tags.get(protocol_1.Tag.PDMD);
        if (pdmd == null || pdmd.toString() !== 'X509') {
            throw error_1.QuicError.fromError(error_1.QuicError.QUIC_INVALID_CRYPTO_MESSAGE_PARAMETER);
        }
        const ver = tags.get(protocol_1.Tag.VER);
        if (ver == null || ver.toString() !== this[symbol_1.kSession][symbol_1.kVersion]) {
            throw error_1.QuicError.fromError(error_1.QuicError.QUIC_INVALID_CRYPTO_MESSAGE_PARAMETER);
        }
        const xlct = tags.get(protocol_1.Tag.XLCT); // 64-bit
        if (xlct == null || xlct.length !== 8) {
            throw error_1.QuicError.fromError(error_1.QuicError.QUIC_INVALID_CRYPTO_MESSAGE_PARAMETER);
        }
        this.tagXLCT = xlct;
        const sni = tags.get(protocol_1.Tag.SNI);
        if (sni != null) { // optional
            this.tagSNI = sni.toString();
            if (this.tagSNI === '' || net_1.isIP(this.tagSNI) !== 0) {
                throw error_1.QuicError.fromError(error_1.QuicError.QUIC_INVALID_CRYPTO_MESSAGE_PARAMETER);
            }
        }
        // const stk = tags.get(Tag.STK) // optional
        // const ccs = tags.get(Tag.CCS) // optional
        // const ccrt = tags.get(Tag.CCRT) // optional
        // -------full client hello messages-----
        const scid = tags.get(protocol_1.Tag.SCID);
        if (scid != null && scid.length === 16) {
            this.tagSCID = scid.toString('hex');
        }
        // if (this.isInchoateCHLO(tags, this.scfg.cert.raw)) {
        //   return this.sendREJ()
        // }
        // const ccrt = tags.get(Tag.AEAD)
        // const ccrt = tags.get(Tag.KEXS)
        // const ccrt = tags.get(Tag.NONC)
        // const ccrt = tags.get(Tag.PUBS)
        // const ccrt = tags.get(Tag.SNO) // optional
        // const ccrt = tags.get(Tag.CETV) // optional
    }
    isInchoateCHLO(tags, cert) {
        if (!tags.has(protocol_1.Tag.PUBS)) {
            return true;
        }
        if (this.tagSCID === '' || this.tagSCID !== this.scfg.id) {
            return true;
        }
        if (this.tagXLCT == null || !crypto_2.fnv1a64Hash(cert).equals(this.tagXLCT)) {
            return true;
        }
        return !this.acceptSTK(tags.get(protocol_1.Tag.STK));
    }
    acceptSTK(buf) {
        if (buf == null) {
            return false;
        }
        const stk = this.sourceToken.decode(buf);
        return stk != null;
    }
    sendREJ() {
        return;
    }
    sendSHLO() {
        return;
    }
}
exports.ServerHandShake = ServerHandShake;
//# sourceMappingURL=handshake.js.map