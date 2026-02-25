import { describe, it, expect, beforeEach } from 'vitest'
import { SessionStorage } from '../session'

describe('SessionStorage', () => {
  let storage: SessionStorage

  beforeEach(() => {
    window.sessionStorage.clear()
    storage = new SessionStorage({ prefix: 'test_' })
  })

  it('should set and get value', () => {
    storage.set('key', 'value')
    expect(storage.get('key')).toBe('value')
  })

  it('should use prefix', () => {
    storage.set('key', 'value')
    expect(window.sessionStorage.getItem('test_key')).toBeTruthy()
  })

  it('should remove value', () => {
    storage.set('key', 'value')
    storage.remove('key')
    expect(storage.get('key')).toBeNull()
  })

  it('should clear all values', () => {
    storage.set('key1', 'value1')
    storage.set('key2', 'value2')
    storage.clear()
    expect(storage.get('key1')).toBeNull()
    expect(storage.get('key2')).toBeNull()
  })

  it('should handle complex objects', () => {
    const obj = { name: 'test', age: 25, nested: { key: 'value' } }
    storage.set('obj', obj)
    expect(storage.get('obj')).toEqual(obj)
  })

  it('should handle null values', () => {
    storage.set('key', null)
    expect(storage.get('key')).toBeNull()
  })

  it('should handle undefined values', () => {
    storage.set('key', undefined)
    expect(storage.get('key')).toBeNull()
  })
})
