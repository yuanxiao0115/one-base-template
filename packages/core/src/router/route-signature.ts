import type { RouteRecordRaw } from 'vue-router';
import { toRouteNameKey } from './route-utils';

type SerializableValue =
  | null
  | boolean
  | number
  | string
  | SerializableValue[]
  | {
      [key: string]: SerializableValue;
    };

function parseSerializableValue(value: unknown): SerializableValue | undefined {
  if (value == null) {
    return null;
  }
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return value;
  }
  if (Array.isArray(value)) {
    return value
      .map((item) => parseSerializableValue(item))
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
    const nextItem = parseSerializableValue(item);
    if (nextItem !== undefined) {
      output[key] = nextItem;
    }
  }
  return output;
}

function toRouteSnapshot(route: RouteRecordRaw): SerializableValue {
  const output: Record<string, SerializableValue> = {
    path: route.path
  };

  const routeName = toRouteNameKey(route.name);
  if (routeName) {
    output.name = routeName;
  }

  const alias = parseSerializableValue(route.alias);
  if (alias !== undefined) {
    output.alias = alias;
  }

  const redirect = parseSerializableValue(route.redirect);
  if (redirect !== undefined) {
    output.redirect = redirect;
  }

  const meta = parseSerializableValue(route.meta);
  if (meta !== undefined) {
    output.meta = meta;
  }

  if (Array.isArray(route.children) && route.children.length > 0) {
    output.children = route.children.map((item) => toRouteSnapshot(item));
  }

  return output;
}

function buildRouteHash(input: string): string {
  let hash = 2166136261;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return `route:${(hash >>> 0).toString(16).padStart(8, '0')}`;
}

export function getRouteSignature(routes: RouteRecordRaw[]): string {
  return buildRouteHash(JSON.stringify(routes.map((item) => toRouteSnapshot(item))));
}
