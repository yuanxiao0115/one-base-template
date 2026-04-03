import { computed, ref } from 'vue';
import { message } from '@one-base-template/ui';
/* oxlint-disable @typescript-eslint/no-explicit-any */

export interface DrawerOptions {
  title?: string;
  submitForm?: Record<string, any>;
  addApi?: (payload: any) => Promise<any>;
  updateApi?: (payload: any) => Promise<any>;
  detailApi?: (params: any) => Promise<any>;
  detailParam?: { value?: any } | any;
  getDetailCallback?: (detailData: { value: any }) => void;
  beforeSubmit?: () => any;
  refresh?: () => void;
}

const Mode = {
  Add: 'add',
  Update: 'update',
  View: 'view'
} as const;

type DrawerMode = (typeof Mode)[keyof typeof Mode];

function isSuccess(code: unknown) {
  return code === 1 || code === 200;
}

export default function useDrawer(options: DrawerOptions, submitRef?: { value?: any }) {
  const visible = ref(false);
  const mode = ref<DrawerMode>(Mode.Add);
  const title = computed(() => options.title ?? '信息');

  async function loadDetailIfNeeded() {
    if (!options.detailApi || mode.value === Mode.Add) {
      return;
    }
    const detailParams =
      typeof options.detailParam === 'object' && options.detailParam && 'value' in options.detailParam
        ? (options.detailParam as { value?: any }).value
        : options.detailParam;
    const res = await options.detailApi(detailParams ?? {});
    if (!isSuccess(res?.code)) {
      return;
    }
    options.getDetailCallback?.({ value: res?.data ?? {} });
  }

  async function openDrawer(nextMode: DrawerMode, _row?: unknown) {
    mode.value = nextMode;
    visible.value = true;
    await loadDetailIfNeeded();
  }

  function closeDrawer() {
    visible.value = false;
  }

  async function submit() {
    const formIns = submitRef?.value;
    if (formIns?.formRef?.validate) {
      const valid = await formIns.formRef.validate().catch(() => false);
      if (!valid) {
        return;
      }
    }

    const payload = options.beforeSubmit ? options.beforeSubmit() : options.submitForm ?? {};
    const api = mode.value === Mode.Add ? options.addApi : options.updateApi;
    if (!api) {
      return;
    }

    const res = await api(payload);
    if (!isSuccess(res?.code)) {
      message.error('提交失败');
      return;
    }

    message.success(mode.value === Mode.Add ? '新增成功' : '保存成功');
    options.refresh?.();
    closeDrawer();
  }

  return {
    visible,
    openDrawer,
    closeDrawer,
    title,
    mode,
    Mode,
    submit
  };
}
