<script setup lang="ts">
  import { computed, nextTick, reactive, ref, watch } from "vue";
  import type { FormInstance, FormRules } from "element-plus";

  import { portalApi } from "../../../api";
  import type { PortalTab } from "../../../types";

  const props = defineProps<{
    modelValue: boolean;
    mode: DialogMode;
    loading?: boolean;
    initial?: Partial<PortalTab>;
  }>();

  const emit = defineEmits<{
    (e: "update:modelValue", v: boolean): void;
    (
      e: "submit",
      payload: {
        tabName: string;
        tabType: number;
        sort: number;
        tabUrl?: string;
        tabUrlOpenMode?: number;
        tabUrlSsoType?: number;
        portalTemplateId?: string;
      }
    ): void;
  }>();

  defineOptions({
    name: "PortalTabAttributeDialog",
  });

  type DialogMode = "create" | "edit";

  const visible = computed({
    get: () => props.modelValue,
    set: (v: boolean) => emit("update:modelValue", v),
  });

  const dialogMode = computed(() => props.mode);

  const title = computed(() => (props.mode === "create" ? "新建页面" : "属性设置"));

  const formRef = ref<FormInstance>();

  const form = reactive({
    tabName: "",
    tabType: 2,
    sort: 1,
    tabUrl: "",
    tabUrlOpenMode: 1,
    tabUrlSsoType: 1,
    portalTemplateId: "",
  });

  interface PortalTemplateOption {
    id: string;
    name: string;
  }

  const tabTypeOptions = [
    {
      key: 1,
      label: "导航组",
    },
    {
      key: 2,
      label: "空白页",
    },
    {
      key: 3,
      label: "链接",
    },
    {
      key: 4,
      label: "门户列表",
    },
  ];

  const openModeOptions = [
    {
      key: 1,
      label: "iframe内嵌",
    },
    {
      key: 2,
      label: "浏览器新页签",
    },
  ];

  const ssoTypeOptions = [
    {
      key: 1,
      label: "不拼接",
    },
    {
      key: 4,
      label: "拼接token",
    },
    {
      key: 3,
      label: "拼接ticket",
    },
  ];

  const isLinkType = computed(() => form.tabType === 3 || form.tabType === 4);
  const isPortalListType = computed(() => form.tabType === 4);
  const portalTemplateLoading = ref(false);
  const portalTemplateOptions = ref<PortalTemplateOption[]>([]);
  const portalTemplateOptionsLoaded = ref(false);

  interface BizResLike {
    code?: unknown;
    success?: unknown;
    data?: unknown;
  }

  function normalizeBizOk(res: BizResLike | null | undefined): boolean {
    const code = res?.code;
    return res?.success === true || code === 0 || code === 200 || String(code) === "0" || String(code) === "200";
  }

  function buildPortalTemplateLink(templateId: string): string {
    const id = String(templateId || "").trim();
    if (!id) {
      return "";
    }
    return `/portal/index?templateId=${encodeURIComponent(id)}`;
  }

  function parsePortalTemplateIdFromUrl(url: string): string {
    const input = String(url || "").trim();
    if (!input) {
      return "";
    }
    try {
      const parsed = new URL(input, "http://localhost");
      if (!parsed.pathname.startsWith("/portal/index")) {
        return "";
      }
      const templateId = parsed.searchParams.get("templateId");
      return templateId ? templateId.trim() : "";
    } catch {
      return "";
    }
  }

  function normalizePortalTemplateOptions(data: unknown): PortalTemplateOption[] {
    if (!data || typeof data !== "object") {
      return [];
    }
    const payload = data as { records?: unknown; list?: unknown };
    const rows = Array.isArray(payload.records) ? payload.records : Array.isArray(payload.list) ? payload.list : [];
    const map = new Map<string, PortalTemplateOption>();
    for (const row of rows) {
      if (!row || typeof row !== "object") {
        continue;
      }
      const item = row as { id?: unknown; templateName?: unknown };
      const id = typeof item.id === "string" ? item.id.trim() : "";
      if (!id) {
        continue;
      }
      const name = typeof item.templateName === "string" && item.templateName.trim() ? item.templateName.trim() : id;
      map.set(id, { id, name });
    }
    return Array.from(map.values());
  }

  async function loadPortalTemplateOptions(force = false) {
    if (portalTemplateLoading.value) {
      return;
    }
    if (portalTemplateOptionsLoaded.value && !force) {
      return;
    }
    portalTemplateLoading.value = true;
    try {
      const res = await portalApi.template.list({
        currentPage: 1,
        pageSize: 200,
      });
      if (!normalizeBizOk(res)) {
        portalTemplateOptions.value = [];
        portalTemplateOptionsLoaded.value = false;
        return;
      }
      portalTemplateOptions.value = normalizePortalTemplateOptions(res?.data);
      portalTemplateOptionsLoaded.value = true;
    } catch {
      portalTemplateOptions.value = [];
      portalTemplateOptionsLoaded.value = false;
    } finally {
      portalTemplateLoading.value = false;
    }
  }

  const rules: FormRules = {
    tabName: [
      {
        required: true,
        message: "请输入页面名称",
        trigger: "blur",
      },
    ],
    tabType: [
      {
        required: true,
        message: "请选择类型",
        trigger: "change",
      },
    ],
    sort: [
      {
        required: true,
        message: "请输入排序序号",
        trigger: "blur",
      },
    ],
    tabUrl: [
      {
        trigger: "blur",
        validator: (_rule, value, callback) => {
          if (!isLinkType.value) {
            return callback();
          }
          const v = typeof value === "string" ? value.trim() : "";
          if (!v) {
            return callback(new Error("请输入地址"));
          }
          callback();
        },
      },
    ],
    tabUrlOpenMode: [
      {
        trigger: "change",
        validator: (_rule, value, callback) => {
          if (!isLinkType.value) {
            return callback();
          }
          if (!value) {
            return callback(new Error("请选择打开方式"));
          }
          callback();
        },
      },
    ],
    tabUrlSsoType: [
      {
        trigger: "change",
        validator: (_rule, value, callback) => {
          if (!isLinkType.value) {
            return callback();
          }
          if (!value) {
            return callback(new Error("请选择单点方式"));
          }
          callback();
        },
      },
    ],
    portalTemplateId: [
      {
        trigger: "change",
        validator: (_rule, value, callback) => {
          if (!isPortalListType.value) {
            return callback();
          }
          const v = typeof value === "string" ? value.trim() : "";
          if (!v) {
            return callback(new Error("请选择门户"));
          }
          callback();
        },
      },
    ],
  };

  function hydrateFromInitial(initial: Partial<PortalTab> | undefined) {
    form.tabName = typeof initial?.tabName === "string" ? initial.tabName : "";
    form.tabType = typeof initial?.tabType === "number" ? initial.tabType : 2;
    form.sort = Number(initial?.sort ?? initial?.tabOrder ?? initial?.order ?? 1) || 1;

    form.tabUrl = typeof initial?.tabUrl === "string" ? initial.tabUrl : "";
    form.tabUrlOpenMode = typeof initial?.tabUrlOpenMode === "number" ? initial.tabUrlOpenMode : 1;
    form.tabUrlSsoType = typeof initial?.tabUrlSsoType === "number" ? initial.tabUrlSsoType : 1;
    form.portalTemplateId = parsePortalTemplateIdFromUrl(form.tabUrl);
  }

  watch(
    () => visible.value,
    (v) => {
      if (!v) {
        return;
      }
      hydrateFromInitial(props.initial);
      if (form.tabType === 4) {
        void loadPortalTemplateOptions(true);
      }
      nextTick(() => formRef.value?.clearValidate());
    }
  );

  watch(
    () => form.tabType,
    (nextType) => {
      if (nextType !== 4) {
        form.portalTemplateId = "";
        return;
      }
      if (!form.portalTemplateId) {
        form.portalTemplateId = parsePortalTemplateIdFromUrl(form.tabUrl);
      }
      if (form.portalTemplateId) {
        form.tabUrl = buildPortalTemplateLink(form.portalTemplateId);
      }
      void loadPortalTemplateOptions();
    }
  );

  watch(
    () => form.portalTemplateId,
    (nextId) => {
      if (!isPortalListType.value) {
        return;
      }
      form.tabUrl = buildPortalTemplateLink(nextId);
    }
  );

  function onCancel() {
    visible.value = false;
  }

  async function onSubmit() {
    const ok = await formRef.value?.validate().catch(() => false);
    if (!ok) {
      return;
    }

    const tabName = form.tabName.trim();
    if (!tabName) {
      return;
    }
    const normalizedUrl = form.tabType === 4 ? buildPortalTemplateLink(form.portalTemplateId) : form.tabUrl.trim();

    emit("submit", {
      tabName,
      tabType: Number(form.tabType),
      sort: Number(form.sort) || 1,
      tabUrl: isLinkType.value ? normalizedUrl : undefined,
      tabUrlOpenMode: isLinkType.value ? form.tabUrlOpenMode : undefined,
      tabUrlSsoType: isLinkType.value ? form.tabUrlSsoType : undefined,
      portalTemplateId: form.tabType === 4 ? form.portalTemplateId : undefined,
    });
  }
</script>

<template>
  <el-dialog v-model="visible" :title width="640px" :close-on-click-modal="false">
    <el-form ref="formRef" :model="form" :rules label-position="top">
      <el-form-item label="名称" prop="tabName">
        <el-input v-model="form.tabName" placeholder="请输入页面名称" maxlength="32" show-word-limit />
      </el-form-item>

      <el-form-item label="类型" prop="tabType">
        <el-radio-group v-model="form.tabType" :disabled="dialogMode === 'edit'">
          <el-radio v-for="opt in tabTypeOptions" :key="opt.key" :value="opt.key">{{ opt.label }}</el-radio>
        </el-radio-group>
      </el-form-item>

      <template v-if="isLinkType">
        <el-form-item v-if="isPortalListType" label="门户列表" prop="portalTemplateId">
          <el-select
            v-model="form.portalTemplateId"
            placeholder="请选择门户"
            filterable
            clearable
            style="width: 100%"
            :loading="portalTemplateLoading"
          >
            <el-option v-for="item in portalTemplateOptions" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>

        <el-form-item label="地址" prop="tabUrl">
          <el-input
            v-model="form.tabUrl"
            :placeholder="isPortalListType ? '选择门户后自动生成跳转地址' : '请输入链接地址'"
            :readonly="isPortalListType"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="打开方式" prop="tabUrlOpenMode">
          <el-radio-group v-model="form.tabUrlOpenMode">
            <el-radio v-for="opt in openModeOptions" :key="opt.key" :value="opt.key">{{ opt.label }}</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="单点方式" prop="tabUrlSsoType">
          <el-radio-group v-model="form.tabUrlSsoType">
            <el-radio v-for="opt in ssoTypeOptions" :key="opt.key" :value="opt.key">{{ opt.label }}</el-radio>
          </el-radio-group>
        </el-form-item>
      </template>

      <el-form-item label="同级序号" prop="sort">
        <el-input-number v-model="form.sort" controls-position="right" :min="1" :value-on-clear="1" />
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="footer">
        <el-button @click="onCancel">取消</el-button>
        <el-button type="primary" :loading @click="onSubmit">{{ dialogMode === 'create' ? '创建' : '保存' }}</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style scoped>
  .footer {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
  }
</style>
