import { normalizePortalTemplateWhiteList } from './normalize-template';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(message);
  }
}

const normalized = normalizePortalTemplateWhiteList({
  code: 200,
  data: {
    whiteDTOS: [],
    whiteList: [{ typeId: 'u1', type: 0, typeName: '用户1' }]
  }
});

assert(Array.isArray(normalized.data?.whiteDTOS), 'whiteDTOS 必须是数组');
assert(normalized.data?.whiteDTOS?.length === 1, 'whiteDTOS 应从 whiteList 回填 1 条数据');
