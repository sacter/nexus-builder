import { Injectable, OnModuleInit } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import * as crypto from 'crypto'

@Injectable()
export class CryptoService implements OnModuleInit {
  private publicKey: string
  private privateKey: string

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    // 优先从环境变量读取 PEM 格式密钥，否则启动时自动生成
    const envPublicKey = this.configService.get('RSA_PUBLIC_KEY')
    const envPrivateKey = this.configService.get('RSA_PRIVATE_KEY')

    if (envPublicKey && envPrivateKey) {
      this.publicKey = envPublicKey
      this.privateKey = envPrivateKey
    } else {
      const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
        modulusLength: 2048,
        publicKeyEncoding: {
          type: 'spki',
          format: 'pem',
        },
        privateKeyEncoding: {
          type: 'pkcs8',
          format: 'pem',
        },
      })
      this.publicKey = publicKey
      this.privateKey = privateKey
    }
  }

  getPublicKey(): string {
    return this.publicKey
  }

  decryptPassword(encrypted: string): string {
    const buffer = Buffer.from(encrypted, 'base64')
    const decrypted = crypto.privateDecrypt(
      {
        key: this.privateKey,
        padding: crypto.constants.RSA_PKCS1_PADDING,
      },
      buffer,
    )
    return decrypted.toString('utf8')
  }
}
