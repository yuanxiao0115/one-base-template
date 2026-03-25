import { describe, it, expect, beforeEach, vi } from 'vite-plus/test';
import { LocalStorage } from '../local';

function createStorageMock(): Storage {
  const map = new Map<string, string>();

  return {
    clear: () => map.clear(),
    getItem: (key: string) => (map.has(key) ? map.get(key)! : null),
    key: (index: number) => Array.from(map.keys())[index] ?? null,
    removeItem: (key: string) => {
      map.delete(key);
    },
    setItem: (key: string, value: string) => {
      map.set(key, String(value));
    },
    get length() {
      return map.size;
    }
  } as Storage;
}

describe('LocalStorage', () => {
  let storage: LocalStorage;

  beforeEach(() => {
    vi.stubGlobal('localStorage', createStorageMock());
    window.localStorage.clear();
    storage = new LocalStorage({ prefix: 'test_' });
  });

  it('should set and get value', () => {
    storage.set('key', 'value');
    expect(storage.get('key')).toBe('value');
  });

  it('should use prefix', () => {
    storage.set('key', 'value');
    expect(window.localStorage.getItem('test_key')).toBeTruthy();
  });

  it('should handle expiration', () => {
    storage.set('key', 'value', 1000); // 1 second
    expect(storage.get('key')).toBe('value');

    // Mock time passing
    vi.advanceTimersByTime(2000);
    expect(storage.get('key')).toBeNull();
  });

  it('should remove value', () => {
    storage.set('key', 'value');
    storage.remove('key');
    expect(storage.get('key')).toBeNull();
  });

  it('should clear all values', () => {
    storage.set('key1', 'value1');
    storage.set('key2', 'value2');
    storage.clear();
    expect(storage.get('key1')).toBeNull();
    expect(storage.get('key2')).toBeNull();
  });

  it('should handle complex objects', () => {
    const obj = { name: 'test', age: 25, nested: { key: 'value' } };
    storage.set('obj', obj);
    expect(storage.get('obj')).toEqual(obj);
  });
});
