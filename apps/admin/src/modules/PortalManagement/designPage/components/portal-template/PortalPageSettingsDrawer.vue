<script setup lang="ts">
  import { computed, ref, watch } from "vue";
  import {
    createDefaultPortalPageSettingsV2,
    normalizePortalPageSettingsV2,
    type PortalPageSettingsV2,
  } from "@one-base-template/portal-engine";
  import PortalPageSettingsForm from "../page-settings/PortalPageSettingsForm.vue";

  const props = withDefaults(
    defineProps<{
      modelValue: boolean;
      loading?: boolean;
      pageName?: string;
      settings?: PortalPageSettingsV2 | null;
      roleOptions?: Array<{ label: string; value: string }>;
      roleLoading?: boolean;
    }>(),
    {
      loading: false,
      pageName: "",
      settings: null,
      roleOptions: () => [],
      roleLoading: false,
    }
  );

  const emit = defineEmits<{
    (e: "update:modelValue", value: boolean): void;
    (e: "submit", settings: PortalPageSettingsV2): void;
  }>();

  defineOptions({
    name: "PortalPageSettingsDrawer",
  });

  const visible = computed({
    get: () => props.modelValue,
    set: (value: boolean) => emit("update:modelValue", value),
  });

  const formState = ref<PortalPageSettingsV2>(createDefaultPortalPageSettingsV2());

  function buildDraftSettings(source?: PortalPageSettingsV2 | null): PortalPageSettingsV2 {
    return JSON.parse(JSON.stringify(normalizePortalPageSettingsV2(source ?? createDefaultPortalPageSettingsV2()))) as PortalPageSettingsV2;
  }

  function hydrateFromProps() {
    formState.value = buildDraftSettings(props.settings);
    if (!formState.value.basic.pageTitle.trim() && props.pageName) {
      formState.value.basic.pageTitle = props.pageName;
    }
  }

  function onCancel() {
    visible.value = false;
  }

  function onSubmit() {
    emit("submit", normalizePortalPageSettingsV2(formState.value));
  }

  watch(
    () => visible.value,
    (opened) => {
      if (!opened) {
        return;
      }
      hydrateFromProps();
    },
    { immediate: true }
  );

  watch(
    () => props.settings,
    () => {
      if (!visible.value) {
        return;
      }
      hydrateFromProps();
    }
  );
</script>

<template>
  <el-drawer
    v-model="visible"
    class="page-settings-drawer"
    title="页面设置"
    size="560px"
    :close-on-click-modal="false"
    destroy-on-close
  >
    <section class="drawer-top">
      <div class="drawer-title">当前页面：{{ props.pageName || "未命名页面" }}</div>
      <div class="drawer-sub-title">在设计页内快速调整页面基础设置，保存后会同步刷新当前模板数据。</div>
    </section>

    <section class="drawer-body">
      <PortalPageSettingsForm v-model="formState" :role-options="props.roleOptions" :role-loading="props.roleLoading" />
    </section>

    <template #footer>
      <div class="drawer-footer">
        <el-button @click="onCancel">取消</el-button>
        <el-button type="primary" :loading="props.loading" @click="onSubmit">保存页面设置</el-button>
      </div>
    </template>
  </el-drawer>
</template>

<style scoped>
  .drawer-top {
    margin-bottom: 12px;
    padding: 10px 12px;
    border: 1px solid #dbe6f5;
    background: linear-gradient(128deg, #f7fbff 0%, #f4f8ff 48%, #ffffff 100%);
  }

  .drawer-title {
    font-size: 14px;
    font-weight: 600;
    color: #0f172a;
  }

  .drawer-sub-title {
    margin-top: 4px;
    font-size: 12px;
    color: #475569;
    line-height: 1.5;
  }

  .drawer-body {
    flex: 1;
    min-height: 0;
    overflow: auto;
  }

  .drawer-footer {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 8px;
  }
</style>
