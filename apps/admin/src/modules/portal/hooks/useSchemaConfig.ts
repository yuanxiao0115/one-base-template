import type { Ref } from 'vue';
import { nextTick, ref, watch } from 'vue';

/**
 * 子组件配置部分定义
 */
export interface SectionConfig {
  defaultValue?: unknown;
}

/**
 * 配置参数接口
 */
export interface SchemaConfigOptions {
  name: string;
  sections: Record<string, SectionConfig>;
  schema: Record<string, unknown>;
  onChange?: (newSchema: Record<string, unknown>) => void;
}

/**
 * 返回值接口
 */
export interface SchemaConfigResult<T extends Record<string, unknown> = Record<string, unknown>> {
  sectionData: T;
  contentData: Ref<Record<string, unknown>>;
  updateSchema: () => void;
}

type SchemaObject = Record<string, unknown>;

function toPlainObject(value: unknown): SchemaObject {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  return value as SchemaObject;
}

/**
 * 用于管理多个子组件数据与 schema 同步的 hooks
 *
 * 说明：该实现来自老项目，已去除 console.log，避免编辑时刷屏。
 */
export function useSchemaConfig<T extends Record<string, unknown> = Record<string, unknown>>(
  options: SchemaConfigOptions
): SchemaConfigResult<T> {
  const { name, sections, schema, onChange } = options;

  // 内部使用的响应式数据引用
  const sectionRefs: Record<string, Ref<SchemaObject>> = {};

  // 初始化响应式数据 - 使用 schema 中的数据
  Object.keys(sections).forEach((key) => {
    const initialValue = schema && schema[key] ? { ...toPlainObject(schema[key]) } : {};
    sectionRefs[key] = ref(initialValue as SchemaObject);
  });

  // 初始化内容数据
  const contentData = ref<SchemaObject>({
    name,
    ...Object.keys(sections).reduce((acc, key) => {
      acc[key] = { ...sectionRefs[key]!.value };
      return acc;
    }, {} as SchemaObject),
  });

  // 创建代理对象，直接暴露给组件使用
  const sectionData = {} as T;

  Object.keys(sections).forEach((key) => {
    Object.defineProperty(sectionData, key, {
      get: () => sectionRefs[key]!.value,
      set: (newValue) => {
        const obj = toPlainObject(newValue);
        sectionRefs[key]!.value = obj;
        contentData.value[key] = { ...obj };
        nextTick(() => updateSchema());
      },
      enumerable: true,
    });
  });

  // 1) 监听 schema 变化，更新本地数据
  watch(
    () => schema,
    (newVal) => {
      if (!newVal) return;

      Object.keys(sections).forEach((key) => {
        if (newVal[key]) {
          sectionRefs[key]!.value = { ...toPlainObject(newVal[key]) };
        }
      });

      contentData.value = {
        ...newVal,
        name: typeof newVal.name === 'string' ? newVal.name : name,
        ...Object.keys(sections).reduce((acc, key) => {
          if (newVal[key]) acc[key] = { ...toPlainObject(newVal[key]) };
          return acc;
        }, {} as SchemaObject),
      };
    },
    { immediate: true, deep: true }
  );

  // 2) 监听子组件数据变化，同步到 contentData 并触发更新
  Object.keys(sectionRefs).forEach((key) => {
    watch(
      sectionRefs[key]!,
      (newVal) => {
        contentData.value[key] = { ...toPlainObject(newVal) };
        nextTick(() => updateSchema());
      },
      { deep: true }
    );
  });

  const updateSchema = () => {
    const schemaData: SchemaObject = {
      name: contentData.value.name,
      ...Object.keys(sections).reduce((acc, key) => {
        acc[key] = { ...toPlainObject(contentData.value[key]) };
        return acc;
      }, {} as SchemaObject),
    };

    onChange?.(schemaData);
  };

  return { sectionData, contentData, updateSchema };
}
