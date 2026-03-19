import { describe, expect, it, vi } from 'vite-plus/test';
import { nextTick, reactive } from 'vue';

import { useSchemaConfig } from './useSchemaConfig';

const BASIC_DEFAULTS = {
  title: '默认标题',
  description: '默认描述',
  showBadge: true
};

async function flushSchemaEffects() {
  await nextTick();
  await nextTick();
}

describe('useSchemaConfig', () => {
  it('schema 缺失 section 时应注入 defaultValue', () => {
    const onChange = vi.fn();
    const schema = reactive<Record<string, unknown>>({});

    const { sectionData, contentData, updateSchema } = useSchemaConfig<{
      basic: Record<string, unknown>;
    }>({
      name: 'simple-hello-content',
      sections: {
        basic: {
          defaultValue: BASIC_DEFAULTS
        }
      },
      schema,
      onChange
    });

    expect(sectionData.basic).toEqual(BASIC_DEFAULTS);
    expect(sectionData.basic).not.toBe(BASIC_DEFAULTS);
    expect(contentData.value.basic).toEqual(BASIC_DEFAULTS);

    updateSchema();

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenLastCalledWith({
      name: 'simple-hello-content',
      basic: BASIC_DEFAULTS
    });
  });

  it('schema 提供部分字段时应与 defaultValue 合并', () => {
    const schema = reactive<Record<string, unknown>>({
      basic: {
        title: '自定义标题'
      }
    });

    const { sectionData, contentData } = useSchemaConfig<{ basic: Record<string, unknown> }>({
      name: 'simple-hello-content',
      sections: {
        basic: {
          defaultValue: BASIC_DEFAULTS
        }
      },
      schema
    });

    expect(sectionData.basic).toEqual({
      ...BASIC_DEFAULTS,
      title: '自定义标题'
    });
    expect(contentData.value.basic).toEqual({
      ...BASIC_DEFAULTS,
      title: '自定义标题'
    });
  });

  it('schema 变更后应持续按 defaultValue 合并', async () => {
    const schema = reactive<Record<string, unknown>>({
      name: '外部名称',
      basic: {
        title: '初始标题'
      }
    });

    const { sectionData, contentData } = useSchemaConfig<{ basic: Record<string, unknown> }>({
      name: 'simple-hello-content',
      sections: {
        basic: {
          defaultValue: BASIC_DEFAULTS
        }
      },
      schema
    });

    schema.basic = {
      showBadge: false
    };
    await flushSchemaEffects();

    expect(sectionData.basic).toEqual({
      ...BASIC_DEFAULTS,
      showBadge: false
    });
    expect(contentData.value.basic).toEqual({
      ...BASIC_DEFAULTS,
      showBadge: false
    });
    expect(contentData.value.name).toBe('外部名称');

    delete schema.basic;
    await flushSchemaEffects();

    expect(sectionData.basic).toEqual(BASIC_DEFAULTS);
    expect(contentData.value.basic).toEqual(BASIC_DEFAULTS);
  });

  it('手动设置 section 对象时应自动补齐默认值并触发回写', async () => {
    const onChange = vi.fn();
    const schema = reactive<Record<string, unknown>>({});

    const { sectionData } = useSchemaConfig<{ basic: Record<string, unknown> }>({
      name: 'simple-hello-content',
      sections: {
        basic: {
          defaultValue: BASIC_DEFAULTS
        }
      },
      schema,
      onChange
    });

    sectionData.basic = {
      title: '手动覆盖标题'
    };

    await flushSchemaEffects();

    const mergedBasic = {
      ...BASIC_DEFAULTS,
      title: '手动覆盖标题'
    };

    expect(sectionData.basic).toEqual(mergedBasic);
    expect(onChange).toHaveBeenCalled();
    expect(onChange).toHaveBeenLastCalledWith({
      name: 'simple-hello-content',
      basic: mergedBasic
    });
  });
});
