import { BadGatewayException } from "@nestjs/common";
import { createCipheriv, createDecipheriv, randomBytes } from "crypto";
import * as CryptoJS from "crypto-js";

const algorithm = "aes-256-cbc";
const keyLength = 16;

export class Encryption {
  /**
   * Generates a random encryption key.
   * @returns {string} - The generated encryption key.
   */
  static generateKey(): string {
    return randomBytes(keyLength).toString("hex");
  }

  /**
   * Encrypts text using AES-256-CBC algorithm.
   * @param {string} text - The text to encrypt.
   * @param {string} key - The encryption key.
   * @returns {object} - The encrypted data along with the initialization vector.
   */
  static encrypt(
    text: string,
    key: string
  ): { status: boolean; key: string; data: string } {
    try {
      const iv = randomBytes(keyLength);
      const cipher = createCipheriv(algorithm, key, iv);
      let encrypted = cipher.update(text, "utf8", "hex");
      encrypted += cipher.final("hex");
      return {
        status: true,
        key: key,
        data: `${encrypted}:${iv.toString("hex")}`,
      };
    } catch (e) {
      console.error(e);
      return {
        status: false,
        key: null,
        data: null,
      };
    }
  }
}

export class Decryption {
  /**
   * Decrypts text using AES-256-CBC algorithm.
   * @param {string} text - The text to decrypt.
   * @param {string} decryptionKey - The decryption key.
   * @returns {string} - The decrypted text.
   */
  static decrypt(text: string, decryptionKey: string): string {
    const key = Buffer.from(decryptionKey, "hex");
    const [encrypted, ivHex] = text.split(":");
    const iv = Buffer.from(ivHex, "hex");
    const decipher = createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  }
}

export class WalletEncryption {
  /**
   * Encrypts a private key using CryptoJS AES encryption.
   * @param {string} privateKey - The private key to encrypt.
   * @param {string} encryptionKey - The encryption key.
   * @returns {string} - The encrypted private key.
   */
  static encryptPrivateKey(privateKey: string, encryptionKey: string): string {
    try {
      const iv = CryptoJS.lib.WordArray.random(16);
      const cipherText = CryptoJS.AES.encrypt(privateKey, encryptionKey, {
        iv: iv,
      });
      return `${cipherText.toString()}:${iv.toString()}`;
    } catch (e) {
      console.error(e);
      throw new Error("Encryption failed.");
    }
  }
}

export class WalletDecryption {
  /**
   * Decrypts an encrypted private key using CryptoJS AES decryption.
   * @param {string} encryptedPrivateKey - The encrypted private key.
   * @param {string} decryptionKey - The decryption key.
   * @returns {string} - The decrypted private key.
   */
  static decryptPrivateKey(
    encryptedPrivateKey: string,
    decryptionKey: string
  ): string {
    try {
      const [cipherText, ivText] = encryptedPrivateKey.split(":");
      const iv = CryptoJS.enc.Hex.parse(ivText);

      const decrypted = CryptoJS.AES.decrypt(cipherText, decryptionKey, {
        iv: iv,
      });
      return decrypted.toString(CryptoJS.enc.Utf8);
    } catch (e) {
      console.error(e);
      throw new BadGatewayException("Transaction failed. Contact Support");
    }
  }
}
