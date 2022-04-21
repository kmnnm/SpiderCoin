import ecdsa = require('elliptic');
import cryptojs from 'crypto-js';
import * as uuid from 'uuid';

const ec = new ecdsa.ec('secp256k1');

export default class Utils {
  static genKeyPair() {
    return ec.genKeyPair();
  }

  static genHash(data: any): string {
    return cryptojs.SHA256(JSON.stringify(data)).toString();
  }

  static genID(): string {
    return uuid.v1();
  }

  static verifySignature(
    publicKey: string,
    signature: string,
    expectedDataHash: string
  ): boolean {
    try {
      return ec
        .keyFromPublic(publicKey, 'hex')
        .verify(expectedDataHash, signature);
    } catch (Error) {
      console.log('Signiture verification error! : ', Error);
      return false;
    }
  }
}
