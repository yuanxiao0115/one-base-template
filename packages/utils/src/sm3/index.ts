import { sm3 } from 'sm-crypto'

/**
 * SM3 哈希算法
 * @param data 要加密的数据
 * @returns 加密后的哈希值
 */
export function hash(data: string): string {
  return sm3(data)
}
