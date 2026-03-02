import type { DictItem } from './api'

export function buildDictLabelMap(items: DictItem[]): Record<string, string> {
  return Object.fromEntries(
    (items || []).map((item) => [String(item.itemValue || ''), item.itemName || ''])
  )
}

export function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback
}
