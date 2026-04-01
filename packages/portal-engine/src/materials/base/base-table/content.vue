<template>
  <div class="content-config">
    <UnifiedContainerContentConfig v-model="sectionData.container" />

    <el-form label-position="top">
      <ObCard title="数据源">
        <el-form-item label="数据模式">
          <el-radio-group v-model="sectionData.dataSource.mode">
            <el-radio value="static">静态 JSON</el-radio>
            <el-radio value="api">接口数据</el-radio>
          </el-radio-group>
        </el-form-item>

        <template v-if="sectionData.dataSource.mode === 'static'">
          <el-form-item label="静态数据 JSON 数组">
            <el-input
              v-model="sectionData.dataSource.staticRowsJson"
              type="textarea"
              :autosize="{ minRows: 8, maxRows: 16 }"
              maxlength="12000"
              show-word-limit
              placeholder="例如：[{title: 新闻, id: 1}]"
            />
          </el-form-item>
        </template>

        <template v-else>
          <el-form-item label="请求方法">
            <el-select v-model="sectionData.dataSource.method">
              <el-option label="GET" value="GET" />
              <el-option label="POST" value="POST" />
              <el-option label="PUT" value="PUT" />
              <el-option label="PATCH" value="PATCH" />
            </el-select>
          </el-form-item>

          <el-form-item label="接口地址">
            <el-input
              v-model.trim="sectionData.dataSource.apiUrl"
              type="textarea"
              :autosize="{ minRows: 2, maxRows: 4 }"
              maxlength="260"
              show-word-limit
              placeholder="请输入接口地址"
            />
          </el-form-item>

          <el-form-item label="请求头 JSON">
            <el-input
              v-model.trim="sectionData.dataSource.headersJson"
              type="textarea"
              :autosize="{ minRows: 2, maxRows: 4 }"
              maxlength="1000"
              show-word-limit
              placeholder="例如：{Authorization: Bearer xxx}"
            />
          </el-form-item>

          <el-form-item label="Query 参数 JSON">
            <el-input
              v-model.trim="sectionData.dataSource.queryJson"
              type="textarea"
              :autosize="{ minRows: 2, maxRows: 4 }"
              maxlength="1000"
              show-word-limit
              placeholder="例如：{categoryId: news}"
            />
          </el-form-item>

          <el-form-item label="Body 参数 JSON">
            <el-input
              v-model.trim="sectionData.dataSource.bodyJson"
              type="textarea"
              :autosize="{ minRows: 2, maxRows: 4 }"
              maxlength="1000"
              show-word-limit
              placeholder="例如：{status: 1}"
            />
          </el-form-item>
        </template>
      </ObCard>

      <ObCard v-if="sectionData.dataSource.mode === 'api'" title="响应映射">
        <el-form-item label="成功字段路径">
          <el-input
            v-model.trim="sectionData.dataSource.successPath"
            maxlength="120"
            show-word-limit
            placeholder="例如：code / data.success"
          />
        </el-form-item>

        <el-form-item label="成功期望值">
          <el-input
            v-model.trim="sectionData.dataSource.successValue"
            maxlength="40"
            show-word-limit
            placeholder="例如：200 / true"
          />
        </el-form-item>

        <el-form-item label="列表字段路径">
          <el-input
            v-model.trim="sectionData.dataSource.listPath"
            maxlength="120"
            show-word-limit
            placeholder="例如：data.records / rows"
          />
        </el-form-item>

        <el-form-item label="总数字段路径">
          <el-input
            v-model.trim="sectionData.dataSource.totalPath"
            maxlength="120"
            show-word-limit
            placeholder="例如：data.total / total"
          />
        </el-form-item>

        <el-form-item label="页码参数名">
          <el-input
            v-model.trim="sectionData.dataSource.pageParamKey"
            maxlength="60"
            show-word-limit
            placeholder="例如：currentPage"
          />
        </el-form-item>

        <el-form-item label="分页大小参数名">
          <el-input
            v-model.trim="sectionData.dataSource.pageSizeParamKey"
            maxlength="60"
            show-word-limit
            placeholder="例如：pageSize"
          />
        </el-form-item>
      </ObCard>

      <ObCard title="表格行为">
        <el-form-item label="显示表头">
          <el-switch v-model="sectionData.table.showHeader" />
        </el-form-item>

        <el-form-item label="显示分页">
          <el-switch v-model="sectionData.table.showPagination" />
        </el-form-item>

        <el-form-item label="显示行分割线">
          <el-switch v-model="sectionData.table.showRowDivider" />
        </el-form-item>

        <el-form-item label="圆点标识（全局）">
          <el-switch v-model="sectionData.table.showDot" />
        </el-form-item>

        <template v-if="sectionData.table.showDot">
          <el-form-item label="圆点字段 key">
            <el-input
              v-model.trim="sectionData.table.dotFieldKey"
              maxlength="120"
              show-word-limit
              placeholder="留空表示所有行都显示"
            />
          </el-form-item>

          <el-form-item label="圆点匹配值">
            <el-input
              v-model.trim="sectionData.table.dotTruthyValue"
              maxlength="40"
              show-word-limit
              placeholder="留空时按字段 truthy 判断"
            />
          </el-form-item>
        </template>

        <el-form-item label="每页条数">
          <el-input-number
            v-model="sectionData.table.pageSize"
            :min="1"
            :max="200"
            controls-position="right"
          />
        </el-form-item>

        <el-form-item label="分页大小选项（逗号分隔）">
          <el-input
            v-model.trim="pageSizesText"
            maxlength="120"
            show-word-limit
            placeholder="例如：10,20,50"
          />
        </el-form-item>

        <el-form-item label="空数据文案">
          <el-input
            v-model.trim="sectionData.table.emptyText"
            maxlength="40"
            show-word-limit
            placeholder="例如：暂无数据"
          />
        </el-form-item>

        <el-form-item label="el-table 扩展属性 JSON">
          <el-input
            v-model.trim="sectionData.table.tablePropsJson"
            type="textarea"
            :autosize="{ minRows: 2, maxRows: 5 }"
            maxlength="1200"
            show-word-limit
            placeholder="例如：{stripe: true, highlightCurrentRow: true}"
          />
        </el-form-item>
      </ObCard>

      <ObCard title="列配置">
        <div class="column-list">
          <div v-if="!sectionData.table.columns.length" class="column-empty">
            暂无列，请点击“新增列”。
          </div>

          <div
            v-for="(column, index) in sectionData.table.columns"
            :key="column.id"
            class="column-card"
          >
            <div class="column-card__header">
              <span>列 {{ index + 1 }}</span>
              <el-button text type="danger" :icon="Delete" @click="removeColumn(index)"
                >删除</el-button
              >
            </div>

            <el-form-item label="列标题">
              <el-input
                v-model.trim="column.label"
                maxlength="30"
                show-word-limit
                placeholder="例如：标题"
              />
            </el-form-item>

            <el-form-item label="字段 key">
              <el-input
                v-model.trim="column.fieldKey"
                maxlength="120"
                show-word-limit
                placeholder="支持路径，例如 article.title"
              />
            </el-form-item>

            <el-form-item label="列宽(px，0为自适应)">
              <el-input-number
                v-model="column.width"
                :min="0"
                :max="1200"
                controls-position="right"
              />
            </el-form-item>

            <el-form-item label="对齐方式">
              <el-select v-model="column.align">
                <el-option label="left" value="left" />
                <el-option label="center" value="center" />
                <el-option label="right" value="right" />
              </el-select>
            </el-form-item>

            <el-form-item label="超长省略">
              <el-switch v-model="column.ellipsis" />
            </el-form-item>

            <el-form-item label="启用链接">
              <el-switch v-model="column.isLink" />
            </el-form-item>

            <template v-if="column.isLink">
              <el-form-item label="跳转路径">
                <el-input
                  v-model.trim="column.linkPath"
                  type="textarea"
                  :autosize="{ minRows: 2, maxRows: 3 }"
                  maxlength="240"
                  show-word-limit
                  placeholder="例如：/portal/detail"
                />
              </el-form-item>

              <el-form-item label="携带参数 key">
                <el-input
                  v-model.trim="column.linkParamKey"
                  maxlength="60"
                  show-word-limit
                  placeholder="例如：id"
                />
              </el-form-item>

              <el-form-item label="参数取值字段 key">
                <el-input
                  v-model.trim="column.linkValueKey"
                  maxlength="120"
                  show-word-limit
                  placeholder="例如：id / articleId"
                />
              </el-form-item>

              <el-form-item label="打开方式">
                <el-select v-model="column.openType">
                  <el-option label="router（站内）" value="router" />
                  <el-option label="newTab（新窗口）" value="newTab" />
                  <el-option label="current（当前窗口）" value="current" />
                </el-select>
              </el-form-item>
            </template>

            <el-form-item label="标签样式展示">
              <el-switch v-model="column.showTag" />
            </el-form-item>

            <template v-if="column.showTag">
              <el-form-item label="标签背景色">
                <ObColorField v-model="column.tagBgColor" show-alpha />
              </el-form-item>

              <el-form-item label="标签文字色">
                <ObColorField v-model="column.tagTextColor" show-alpha />
              </el-form-item>

              <el-form-item label="标签背景色字段 key">
                <el-input
                  v-model.trim="column.tagBgColorFieldKey"
                  maxlength="120"
                  show-word-limit
                  placeholder="可选，留空使用上方背景色"
                />
              </el-form-item>

              <el-form-item label="标签文字色字段 key">
                <el-input
                  v-model.trim="column.tagTextColorFieldKey"
                  maxlength="120"
                  show-word-limit
                  placeholder="可选，留空使用上方文字色"
                />
              </el-form-item>
            </template>

            <el-form-item label="列级圆点">
              <el-switch v-model="column.showDot" />
            </el-form-item>

            <template v-if="column.showDot">
              <el-form-item label="圆点字段 key（列级）">
                <el-input
                  v-model.trim="column.dotFieldKey"
                  maxlength="120"
                  show-word-limit
                  placeholder="留空使用全局设置"
                />
              </el-form-item>

              <el-form-item label="圆点匹配值（列级）">
                <el-input
                  v-model.trim="column.dotTruthyValue"
                  maxlength="40"
                  show-word-limit
                  placeholder="留空按字段 truthy"
                />
              </el-form-item>
            </template>
          </div>
        </div>

        <el-button type="primary" plain :icon="Plus" @click="addColumn">新增列</el-button>
      </ObCard>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Delete, Plus } from '@element-plus/icons-vue';
import { ObCard, ObColorField } from '@one-base-template/ui';
import { useSchemaConfig } from '../../../composables/useSchemaConfig';
import {
  UnifiedContainerContentConfig,
  mergeUnifiedContainerContentConfig
} from '../../common/unified-container';
import type { UnifiedContainerContentConfigModel } from '../../common/unified-container';
import { normalizeStringArray, toPositiveNumber } from '../common/material-utils';

type DataModeType = 'static' | 'api';
type HttpMethodType = 'GET' | 'POST' | 'PUT' | 'PATCH';
type ColumnAlignType = 'left' | 'center' | 'right';
type LinkOpenType = 'router' | 'newTab' | 'current';

interface TableColumnModel {
  id: string;
  label: string;
  fieldKey: string;
  width: number;
  align: ColumnAlignType;
  ellipsis: boolean;
  isLink: boolean;
  linkPath: string;
  linkParamKey: string;
  linkValueKey: string;
  openType: LinkOpenType;
  showTag: boolean;
  tagBgColor: string;
  tagTextColor: string;
  tagBgColorFieldKey: string;
  tagTextColorFieldKey: string;
  showDot: boolean;
  dotFieldKey: string;
  dotTruthyValue: string;
}

interface BaseTableContentData {
  container: UnifiedContainerContentConfigModel;
  dataSource: {
    mode: DataModeType;
    staticRowsJson: string;
    method: HttpMethodType;
    apiUrl: string;
    headersJson: string;
    queryJson: string;
    bodyJson: string;
    listPath: string;
    totalPath: string;
    successPath: string;
    successValue: string;
    pageParamKey: string;
    pageSizeParamKey: string;
  };
  table: {
    showHeader: boolean;
    showPagination: boolean;
    showRowDivider: boolean;
    showDot: boolean;
    dotFieldKey: string;
    dotTruthyValue: string;
    pageSize: number;
    pageSizes: number[];
    emptyText: string;
    tablePropsJson: string;
    columns: TableColumnModel[];
  };
}

const BASE_TABLE_CONTENT_CONTAINER_DEFAULTS = mergeUnifiedContainerContentConfig({
  title: '数据表格',
  subtitle: '支持静态 JSON 与接口返回映射'
});

const BASE_TABLE_CONTENT_DATA_SOURCE_DEFAULTS: BaseTableContentData['dataSource'] = {
  mode: 'static',
  staticRowsJson: '[\n  {"title":"示例新闻","publishTime":"2026-03-01","id":"1"}\n]',
  method: 'GET',
  apiUrl: '',
  headersJson: '{}',
  queryJson: '{}',
  bodyJson: '{}',
  listPath: 'data.records',
  totalPath: 'data.total',
  successPath: 'code',
  successValue: '200',
  pageParamKey: 'currentPage',
  pageSizeParamKey: 'pageSize'
};

const BASE_TABLE_CONTENT_TABLE_DEFAULTS: BaseTableContentData['table'] = {
  showHeader: true,
  showPagination: true,
  showRowDivider: true,
  showDot: false,
  dotFieldKey: '',
  dotTruthyValue: '',
  pageSize: 10,
  pageSizes: [10, 20, 50],
  emptyText: '暂无数据',
  tablePropsJson: '{}',
  columns: []
};

const props = defineProps({
  schema: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['schemaChange']);

const { sectionData } = useSchemaConfig<BaseTableContentData>({
  name: 'base-table-content',
  sections: {
    container: {
      defaultValue: BASE_TABLE_CONTENT_CONTAINER_DEFAULTS
    },
    dataSource: {
      defaultValue: BASE_TABLE_CONTENT_DATA_SOURCE_DEFAULTS
    },
    table: {
      defaultValue: BASE_TABLE_CONTENT_TABLE_DEFAULTS
    }
  },
  schema: props.schema,
  onChange: (newSchema) => {
    emit('schemaChange', 'content', newSchema);
  }
});

function createColumn(seed: number): TableColumnModel {
  return {
    id: `column-${Date.now()}-${Math.random().toString(36).slice(2, 7)}-${seed}`,
    label: `列${seed}`,
    fieldKey: '',
    width: 0,
    align: 'left',
    ellipsis: true,
    isLink: false,
    linkPath: '',
    linkParamKey: 'id',
    linkValueKey: 'id',
    openType: 'router',
    showTag: false,
    tagBgColor: '#dbeafe',
    tagTextColor: '#1d4ed8',
    tagBgColorFieldKey: '',
    tagTextColorFieldKey: '',
    showDot: false,
    dotFieldKey: '',
    dotTruthyValue: ''
  };
}

function normalizeColumn(item: Partial<TableColumnModel>, index: number): TableColumnModel {
  const align = item.align === 'center' || item.align === 'right' ? item.align : 'left';
  const openType: LinkOpenType =
    item.openType === 'newTab' || item.openType === 'current' ? item.openType : 'router';
  return {
    id: String(item.id || `column-${index + 1}`),
    label: String(item.label || `列${index + 1}`),
    fieldKey: String(item.fieldKey || ''),
    width: Number.isFinite(Number(item.width)) ? Number(item.width) : 0,
    align,
    ellipsis: item.ellipsis !== false,
    isLink: item.isLink === true,
    linkPath: String(item.linkPath || ''),
    linkParamKey: String(item.linkParamKey || 'id'),
    linkValueKey: String(item.linkValueKey || item.fieldKey || 'id'),
    openType,
    showTag: item.showTag === true,
    tagBgColor: String(item.tagBgColor || '#dbeafe'),
    tagTextColor: String(item.tagTextColor || '#1d4ed8'),
    tagBgColorFieldKey: String(item.tagBgColorFieldKey || ''),
    tagTextColorFieldKey: String(item.tagTextColorFieldKey || ''),
    showDot: item.showDot === true,
    dotFieldKey: String(item.dotFieldKey || ''),
    dotTruthyValue: String(item.dotTruthyValue || '')
  };
}

sectionData.container = mergeUnifiedContainerContentConfig(sectionData.container);
sectionData.dataSource = {
  mode: sectionData.dataSource?.mode === 'api' ? 'api' : 'static',
  staticRowsJson:
    typeof sectionData.dataSource?.staticRowsJson === 'string'
      ? sectionData.dataSource.staticRowsJson
      : BASE_TABLE_CONTENT_DATA_SOURCE_DEFAULTS.staticRowsJson,
  method:
    sectionData.dataSource?.method === 'POST' ||
    sectionData.dataSource?.method === 'PUT' ||
    sectionData.dataSource?.method === 'PATCH'
      ? sectionData.dataSource.method
      : BASE_TABLE_CONTENT_DATA_SOURCE_DEFAULTS.method,
  apiUrl:
    typeof sectionData.dataSource?.apiUrl === 'string'
      ? sectionData.dataSource.apiUrl
      : BASE_TABLE_CONTENT_DATA_SOURCE_DEFAULTS.apiUrl,
  headersJson:
    typeof sectionData.dataSource?.headersJson === 'string'
      ? sectionData.dataSource.headersJson
      : BASE_TABLE_CONTENT_DATA_SOURCE_DEFAULTS.headersJson,
  queryJson:
    typeof sectionData.dataSource?.queryJson === 'string'
      ? sectionData.dataSource.queryJson
      : BASE_TABLE_CONTENT_DATA_SOURCE_DEFAULTS.queryJson,
  bodyJson:
    typeof sectionData.dataSource?.bodyJson === 'string'
      ? sectionData.dataSource.bodyJson
      : BASE_TABLE_CONTENT_DATA_SOURCE_DEFAULTS.bodyJson,
  listPath:
    typeof sectionData.dataSource?.listPath === 'string' && sectionData.dataSource.listPath.trim()
      ? sectionData.dataSource.listPath
      : BASE_TABLE_CONTENT_DATA_SOURCE_DEFAULTS.listPath,
  totalPath:
    typeof sectionData.dataSource?.totalPath === 'string' && sectionData.dataSource.totalPath.trim()
      ? sectionData.dataSource.totalPath
      : BASE_TABLE_CONTENT_DATA_SOURCE_DEFAULTS.totalPath,
  successPath:
    typeof sectionData.dataSource?.successPath === 'string' &&
    sectionData.dataSource.successPath.trim()
      ? sectionData.dataSource.successPath
      : BASE_TABLE_CONTENT_DATA_SOURCE_DEFAULTS.successPath,
  successValue:
    typeof sectionData.dataSource?.successValue === 'string' &&
    sectionData.dataSource.successValue.trim()
      ? sectionData.dataSource.successValue
      : BASE_TABLE_CONTENT_DATA_SOURCE_DEFAULTS.successValue,
  pageParamKey:
    typeof sectionData.dataSource?.pageParamKey === 'string' &&
    sectionData.dataSource.pageParamKey.trim()
      ? sectionData.dataSource.pageParamKey
      : BASE_TABLE_CONTENT_DATA_SOURCE_DEFAULTS.pageParamKey,
  pageSizeParamKey:
    typeof sectionData.dataSource?.pageSizeParamKey === 'string' &&
    sectionData.dataSource.pageSizeParamKey.trim()
      ? sectionData.dataSource.pageSizeParamKey
      : BASE_TABLE_CONTENT_DATA_SOURCE_DEFAULTS.pageSizeParamKey
};

const rawColumns = Array.isArray(sectionData.table?.columns) ? sectionData.table.columns : [];
sectionData.table = {
  showHeader: sectionData.table?.showHeader !== false,
  showPagination: sectionData.table?.showPagination !== false,
  showRowDivider: sectionData.table?.showRowDivider !== false,
  showDot: sectionData.table?.showDot === true,
  dotFieldKey:
    typeof sectionData.table?.dotFieldKey === 'string' ? sectionData.table.dotFieldKey : '',
  dotTruthyValue:
    typeof sectionData.table?.dotTruthyValue === 'string' ? sectionData.table.dotTruthyValue : '',
  pageSize: Math.max(
    1,
    toPositiveNumber(sectionData.table?.pageSize, BASE_TABLE_CONTENT_TABLE_DEFAULTS.pageSize)
  ),
  pageSizes:
    Array.isArray(sectionData.table?.pageSizes) && sectionData.table.pageSizes.length
      ? sectionData.table.pageSizes.map((item) => Math.max(1, Number(item) || 10))
      : [...BASE_TABLE_CONTENT_TABLE_DEFAULTS.pageSizes],
  emptyText:
    typeof sectionData.table?.emptyText === 'string' && sectionData.table.emptyText.trim()
      ? sectionData.table.emptyText
      : BASE_TABLE_CONTENT_TABLE_DEFAULTS.emptyText,
  tablePropsJson:
    typeof sectionData.table?.tablePropsJson === 'string'
      ? sectionData.table.tablePropsJson
      : BASE_TABLE_CONTENT_TABLE_DEFAULTS.tablePropsJson,
  columns: rawColumns.length
    ? rawColumns.map((item, index) => normalizeColumn(item, index))
    : [createColumn(1)]
};

const pageSizesText = computed({
  get: () => sectionData.table.pageSizes.join(','),
  set: (value: string) => {
    const values = normalizeStringArray(value)
      .map((item) => Number(item))
      .filter((item) => Number.isFinite(item) && item > 0)
      .map((item) => Math.floor(item));
    sectionData.table.pageSizes = values.length
      ? values
      : [...BASE_TABLE_CONTENT_TABLE_DEFAULTS.pageSizes];
  }
});

function addColumn() {
  sectionData.table.columns.push(createColumn(sectionData.table.columns.length + 1));
}

function removeColumn(index: number) {
  sectionData.table.columns.splice(index, 1);
}

defineOptions({
  name: 'base-table-content'
});
</script>

<style scoped>
.content-config {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.column-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 10px;
}

.column-empty {
  border: 1px dashed var(--el-border-color);
  border-radius: 8px;
  padding: 12px;
  font-size: 12px;
  color: #64748b;
  background: #f8fafc;
}

.column-card {
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  padding: 12px;
  background: #fff;
}

.column-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 13px;
  font-weight: 600;
  color: #334155;
}
</style>
