import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as CryptoJS from 'crypto-js';

@Injectable()
export class EncryptionService {
  private readonly secretKey: string;

  constructor(private readonly configService: ConfigService) {
    const envKey = this.configService.get<string>('AES_SECRET_KEY');
    const stage = this.configService.get<string>('STAGE');

    if (!envKey) {
      // En producción, lanzar error si no hay clave configurada
      if (process.env.STAGE === 'prod') {
        throw new Error(
          'AES_SECRET_KEY debe estar configurada en producción. Agrega esta variable de entorno con exactamente 32 caracteres.',
        );
      }
      this.secretKey = 'default-secret-key-32-bytes-long!!'; // 32 caracteres = 32 bytes
    } else {
      this.secretKey = envKey;
    }

    if (this.secretKey.length !== 32) {
      throw new Error(
        `AES_SECRET_KEY debe tener exactamente 32 caracteres (32 bytes) para AES-256. Longitud actual: ${this.secretKey.length}`,
      );
    }
  }

  /**
   * Encripta un texto usando AES-256
   * @param text Texto a encriptar
   * @returns Texto encriptado en formato base64
   */
  encrypt(text: string): string {
    try {
      const encrypted = CryptoJS.AES.encrypt(text, this.secretKey).toString();
      return encrypted;
    } catch (error) {
      throw new Error(`Error al encriptar: ${error.message}`);
    }
  }

  /**
   * Desencripta un texto encriptado con AES-256
   * @param encryptedText Texto encriptado
   * @returns Texto desencriptado
   */
  decrypt(encryptedText: string): string {
    try {
      const decrypted = CryptoJS.AES.decrypt(
        encryptedText,
        this.secretKey,
      ).toString(CryptoJS.enc.Utf8);
      return decrypted;
    } catch (error) {
      throw new Error(`Error al desencriptar: ${error.message}`);
    }
  }

  /**
   * Compara una contraseña en texto plano con una contraseña encriptada
   * @param plainPassword Contraseña en texto plano
   * @param encryptedPassword Contraseña encriptada
   * @returns true si coinciden, false en caso contrario
   */
  compare(plainPassword: string, encryptedPassword: string): boolean {
    try {
      // Si el texto encriptado está vacío o es inválido, retornar false
      if (!encryptedPassword || encryptedPassword.trim().length === 0) {
        return false;
      }

      const decrypted = this.decrypt(encryptedPassword);

      // Si la desencriptación resultó en string vacío, la contraseña no coincide
      if (!decrypted || decrypted.length === 0) {
        return false;
      }

      return decrypted === plainPassword;
    } catch (error) {
      // Si hay cualquier error al desencriptar, la contraseña no coincide
      return false;
    }
  }
}
