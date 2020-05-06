'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
// **Github:** https://github.com/fidm/quic
//
// **License:** MIT
// https://github.com/dcodeIO/long.js/pull/60
const long_1 = tslib_1.__importDefault(require("long"));
const tweetnacl_1 = require("tweetnacl");
const asn1_1 = require("@fidm/asn1");
const x509_1 = require("@fidm/x509");
// http://isthe.com/chongo/tech/comp/fnv/#FNV-param
const fnvOffset64 = long_1.default.fromString('14695981039346656037', true, 10);
const fnvPrime64 = long_1.default.fromString('1099511628211', true, 10);
function fnv1a64Hash(data) {
    let hash = long_1.default.fromBits(fnvOffset64.getLowBits(), fnvOffset64.getHighBits(), true);
    for (const bit of data) {
        hash = hash.xor(bit);
        hash = hash.mul(fnvPrime64);
    }
    return Buffer.from(hash.toBytesBE());
}
exports.fnv1a64Hash = fnv1a64Hash;
class SecureContext {
}
exports.SecureContext = SecureContext;
const tokenValidator = {
    name: 'SourceToken',
    class: asn1_1.Class.UNIVERSAL,
    tag: asn1_1.Tag.SEQUENCE,
    value: [{
            name: 'SourceToken.IP',
            class: asn1_1.Class.UNIVERSAL,
            tag: asn1_1.Tag.OCTETSTRING,
            capture: 'ip',
        }, {
            name: 'SourceToken.timestamp',
            class: asn1_1.Class.UNIVERSAL,
            tag: asn1_1.Tag.INTEGER,
            capture: 'ts',
        }],
};
class SourceToken {
    constructor() {
        this.key = tweetnacl_1.randomBytes(tweetnacl_1.secretbox.keyLength);
    }
    encode(ip) {
        let data = x509_1.bytesFromIP(ip);
        if (data == null) {
            throw new Error(`Invalid IP string: ${ip}`);
        }
        data = asn1_1.ASN1.Seq([
            new asn1_1.ASN1(asn1_1.Class.UNIVERSAL, asn1_1.Tag.OCTETSTRING, data),
            asn1_1.ASN1.Integer(Math.floor(Date.now() / 1000)),
        ]).toDER();
        const nonce = tweetnacl_1.randomBytes(tweetnacl_1.secretbox.nonceLength);
        return Buffer.concat([tweetnacl_1.secretbox(data, nonce, this.key), nonce]);
    }
    decode(buf) {
        if (buf.length <= tweetnacl_1.secretbox.nonceLength) {
            throw new Error('Invalid SourceToken buffer to decode');
        }
        const nonce = buf.slice(buf.length - tweetnacl_1.secretbox.nonceLength);
        const data = tweetnacl_1.secretbox.open(buf.slice(0, buf.length - tweetnacl_1.secretbox.nonceLength), nonce, this.key);
        if (data == null) {
            throw new Error('SourceToken verify failured');
        }
        const captures = asn1_1.ASN1.parseDERWithTemplate(Buffer.from(data.buffer, data.byteOffset, data.length), tokenValidator);
        return {
            ip: x509_1.bytesToIP(captures.ip.bytes),
            ts: new Date(captures.ts.value * 1000),
        };
    }
}
exports.SourceToken = SourceToken;
//# sourceMappingURL=crypto.js.map