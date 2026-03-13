<script setup lang="ts">
  import { computed } from 'vue';
  import { ObCard } from '@one-base-template/ui';
  import {
    createDefaultPortalDataSourceModel,
    mergePortalDataSourceModel,
    type PortalDataSourceModel,
  } from './portal-data-source';

  withDefaults(
    defineProps<{
      title?: string;
      staticJsonLabel?: string;
      staticJsonPlaceholder?: string;
      staticJsonMaxlength?: number;
      staticMinRows?: number;
      staticMaxRows?: number;
      showPageParams?: boolean;
    }>(),
    {
      title: '数据源',
      staticJsonLabel: '静态数据 JSON 数组',
      staticJsonPlaceholder: '例如：[{"title":"示例数据","id":"1"}]',
      staticJsonMaxlength: 12000,
      staticMinRows: 8,
      staticMaxRows: 16,
      showPageParams: true,
    }
  );

  const modelValue = defineModel<PortalDataSourceModel>({
    default: () => createDefaultPortalDataSourceModel(),
  });

  modelValue.value = mergePortalDataSourceModel(modelValue.value);

  const isApiMode = computed(() => modelValue.value.mode === 'api');

  defineOptions({
    name: 'PortalDataSourceCard',
  });
</script>

<template>
  <ObCard :title="title">
    <el-form-item label="数据模式">
      <el-radio-group v-model="modelValue.mode">
        <el-radio value="static">静态 JSON</el-radio>
        <el-radio value="api">接口数据</el-radio>
      </el-radio-group>
    </el-form-item>

    <template v-if="!isApiMode">
      <el-form-item :label="staticJsonLabel">
        <el-input
          v-model="modelValue.staticRowsJson"
          type="textarea"
          :autosize="{ minRows: staticMinRows, maxRows: staticMaxRows }"
          :maxlength="staticJsonMaxlength"
          show-word-limit
          :placeholder="staticJsonPlaceholder"
        />
      </el-form-item>
    </template>

    <template v-else>
      <el-form-item label="请求方法">
        <el-select v-model="modelValue.method">
          <el-option label="GET" value="GET" />
          <el-option label="POST" value="POST" />
          <el-option label="PUT" value="PUT" />
          <el-option label="PATCH" value="PATCH" />
        </el-select>
      </el-form-item>

      <el-form-item label="接口地址">
        <el-input
          v-model.trim="modelValue.apiUrl"
          type="textarea"
          :autosize="{ minRows: 2, maxRows: 4 }"
          maxlength="260"
          show-word-limit
          placeholder="请输入接口地址"
        />
      </el-form-item>

      <el-form-item label="请求头 JSON">
        <el-input
          v-model.trim="modelValue.headersJson"
          type="textarea"
          :autosize="{ minRows: 2, maxRows: 4 }"
          maxlength="1000"
          show-word-limit
          placeholder='例如：{"Authorization":"Bearer xxx"}'
        />
      </el-form-item>

      <el-form-item label="Query 参数 JSON">
        <el-input
          v-model.trim="modelValue.queryJson"
          type="textarea"
          :autosize="{ minRows: 2, maxRows: 4 }"
          maxlength="1000"
          show-word-limit
          placeholder='例如：{"categoryId":"news"}'
        />
      </el-form-item>

      <el-form-item label="Body 参数 JSON">
        <el-input
          v-model.trim="modelValue.bodyJson"
          type="textarea"
          :autosize="{ minRows: 2, maxRows: 4 }"
          maxlength="1000"
          show-word-limit
          placeholder='例如：{"status":1}'
        />
      </el-form-item>

      <el-form-item label="成功字段路径">
        <el-input
          v-model.trim="modelValue.successPath"
          type="textarea"
          :autosize="{ minRows: 2, maxRows: 3 }"
          maxlength="120"
          show-word-limit
          placeholder="例如：code / data.success"
        />
      </el-form-item>

      <el-form-item label="成功期望值">
        <el-input
          v-model.trim="modelValue.successValue"
          type="textarea"
          :autosize="{ minRows: 2, maxRows: 3 }"
          maxlength="60"
          show-word-limit
          placeholder="例如：200 / true"
        />
      </el-form-item>

      <el-form-item label="列表字段路径">
        <el-input
          v-model.trim="modelValue.listPath"
          type="textarea"
          :autosize="{ minRows: 2, maxRows: 3 }"
          maxlength="120"
          show-word-limit
          placeholder="例如：data.records / rows"
        />
      </el-form-item>

      <el-form-item label="总数字段路径">
        <el-input
          v-model.trim="modelValue.totalPath"
          type="textarea"
          :autosize="{ minRows: 2, maxRows: 3 }"
          maxlength="120"
          show-word-limit
          placeholder="例如：data.total / total"
        />
      </el-form-item>

      <template v-if="showPageParams">
        <el-form-item label="页码参数名">
          <el-input
            v-model.trim="modelValue.pageParamKey"
            type="textarea"
            :autosize="{ minRows: 2, maxRows: 3 }"
            maxlength="60"
            show-word-limit
            placeholder="例如：currentPage"
          />
        </el-form-item>

        <el-form-item label="分页大小参数名">
          <el-input
            v-model.trim="modelValue.pageSizeParamKey"
            type="textarea"
            :autosize="{ minRows: 2, maxRows: 3 }"
            maxlength="60"
            show-word-limit
            placeholder="例如：pageSize"
          />
        </el-form-item>
      </template>
    </template>

    <slot />
  </ObCard>
</template>
