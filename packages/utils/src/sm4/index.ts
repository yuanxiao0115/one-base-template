import { SM4 } from 'gm-crypto'
const key: string = '6f889d54ad8c4ddb8c525fc96a185444' // Any string of 32 hexadecimal digits
export function encryptedCode(originalData: string): string {
  //加密
  const encryptedData = SM4.encrypt(originalData, key, {
    inputEncoding: 'utf8',
    outputEncoding: 'base64',
  })
  return encryptedData
}
export function decryptedCode(encryptedData: string): string {
  //解密
  const decryptedData = SM4.decrypt(encryptedData, key, {
    inputEncoding: 'base64',
    outputEncoding: 'utf8',
  })
  return decryptedData
}
