declare module 'gm-crypto' {
  export interface SM4Options {
    inputEncoding?: 'utf8' | 'base64' | 'hex'
    outputEncoding?: 'utf8' | 'base64' | 'hex'
  }

  export class SM4 {
    static encrypt(data: string, key: string, options?: SM4Options): string
    static decrypt(data: string, key: string, options?: SM4Options): string
  }
}
