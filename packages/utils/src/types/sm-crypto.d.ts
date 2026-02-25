declare module 'sm-crypto' {
  export function sm3(data: string): string
  export function sm4(data: string, key: string, options?: any): string
}
