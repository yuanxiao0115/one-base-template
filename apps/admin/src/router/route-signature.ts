import type { RouteRecordName, RouteRecordRaw } from 'vue-router';

type SerializableValue =
  | null
  | boolean
  | number
  | string
  | SerializableValue[]
  | {
      [key: string]: SerializableValue;
    };

function normalizeRouteName(name: RouteRecordName | null | undefined): string | null {
  if (name == null) {
    return null;
  }
  return String(name);
}

function normalizeSerializableValue(value: unknown): SerializableValue | undefined {
  if (value == null) {
    return null;
  }
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return value;
  }
  if (Array.isArray(value)) {
    return value
      .map((item) => normalizeSerializableValue(item))
      .filter((item): item is SerializableValue => item !== undefined);
  }
  if (value instanceof Date) {
    return value.toISOString();
  }
  if (typeof value !== 'object') {
    return undefined;
  }

  const output: Record<string, SerializableValue> = {};
  for (const [key, item] of Object.entries(value as Record<string, unknown>).sort(
    ([left], [right]) => left.localeCompare(right)
  )) {
    const normalizedItem = normalizeSerializableValue(item);
    if (normalizedItem !== undefined) {
      output[key] = normalizedItem;
    }
  }
  return output;
}

function toRouteSnapshot(route: RouteRecordRaw): SerializableValue {
  const output: Record<string, SerializableValue> = {
    path: route.path
  };

  const name = normalizeRouteName(route.name);
  if (name) {
    output.name = name;
  }

  const alias = normalizeSerializableValue(route.alias);
  if (alias !== undefined) {
    output.alias = alias;
  }

  const redirect = normalizeSerializableValue(route.redirect);
  if (redirect !== undefined) {
    output.redirect = redirect;
  }

  const meta = normalizeSerializableValue(route.meta);
  if (meta !== undefined) {
    output.meta = meta;
  }

  if (Array.isArray(route.children) && route.children.length > 0) {
    output.children = route.children.map((item) => toRouteSnapshot(item));
  }

  return output;
}

function hashString(input: string): string {
  let hash = 2166136261;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return `route:${(hash >>> 0).toString(16).padStart(8, '0')}`;
}

export function getRouteSignature(routes: RouteRecordRaw[]): string {
  return hashString(JSON.stringify(routes.map((item) => toRouteSnapshot(item))));
}
