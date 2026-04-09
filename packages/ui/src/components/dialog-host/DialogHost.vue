<script setup lang="ts">
import { defineComponent, type PropType } from 'vue';
import { closeDialog, getDialogHostQueue, removeDialog } from './dialog-host';
import type {
  DialogHostActionContext,
  DialogHostBeforeCloseContext,
  DialogHostCloseReason,
  DialogHostQueueItem,
  DialogHostRenderContext,
  DialogHostRenderer
} from './types';

defineOptions({
  name: 'DialogHost'
});

const dialogQueue = getDialogHostQueue();

const RenderSlot = defineComponent({
  name: 'DialogHostRenderSlot',
  props: {
    renderer: {
      type: Function as PropType<DialogHostRenderer>,
      required: true
    },
    context: {
      type: Object as PropType<DialogHostRenderContext>,
      required: true
    }
  },
  setup(props) {
    return () => props.renderer(props.context);
  }
});

function buildActionContext(item: DialogHostQueueItem): DialogHostActionContext {
  return {
    id: item.id,
    payload: item.payload
  };
}

function buildRenderContext(item: DialogHostQueueItem): DialogHostRenderContext {
  return {
    id: item.id,
    payload: item.payload,
    close: (reason: DialogHostCloseReason = 'api') => {
      closeDialog(item.id, reason);
    },
    confirm: () => handleConfirm(item)
  };
}

async function canClose(
  item: DialogHostQueueItem,
  reason: DialogHostCloseReason
): Promise<boolean> {
  if (!item.beforeClose) {
    return true;
  }

  const context: DialogHostBeforeCloseContext = {
    ...buildActionContext(item),
    reason
  };

  const result = await item.beforeClose(context);
  return result !== false;
}

async function canConfirm(item: DialogHostQueueItem): Promise<boolean> {
  if (!item.beforeConfirm) {
    return true;
  }

  const result = await item.beforeConfirm(buildActionContext(item));
  return result !== false;
}

async function handleConfirm(item: DialogHostQueueItem) {
  if (item.confirming || item.loading) {
    return;
  }

  item.confirming = true;
  try {
    const allowed = await canConfirm(item);
    if (!allowed) {
      return;
    }

    if (item.onConfirm) {
      await item.onConfirm(buildActionContext(item));
    }

    closeDialog(item.id, 'confirm');
  } finally {
    item.confirming = false;
  }
}

async function handleCancel(item: DialogHostQueueItem) {
  const allowed = await canClose(item, 'cancel');
  if (!allowed) {
    return;
  }

  closeDialog(item.id, 'cancel');
}

async function onBeforeClose(item: DialogHostQueueItem, done: () => void) {
  const allowed = await canClose(item, 'cancel');
  if (!allowed) {
    return;
  }

  item.closeReason = 'cancel';
  done();
}

async function onClose(item: DialogHostQueueItem) {
  if (!item.onClose) {
    return;
  }

  await item.onClose({
    ...buildActionContext(item),
    reason: item.closeReason
  });
}

async function onClosed(item: DialogHostQueueItem) {
  if (item.onClosed) {
    await item.onClosed({
      ...buildActionContext(item),
      reason: item.closeReason
    });
  }

  removeDialog(item.id);
}

function hasFooter(item: DialogHostQueueItem): boolean {
  return Boolean(item.footerRenderer || item.showFooter);
}

function getDialogClass(item: DialogHostQueueItem) {
  return ['ob-dialog-host', 'ob-dialog-host--dialog', item.className];
}

function getDrawerClass(item: DialogHostQueueItem) {
  return ['ob-dialog-host', 'ob-dialog-host--drawer', item.className];
}

function getBeforeCloseHandler(item: DialogHostQueueItem) {
  return (done: () => void) => {
    void onBeforeClose(item, done);
  };
}
</script>

<template>
  <template v-for="item in dialogQueue" :key="item.id">
    <el-dialog
      v-if="item.container === 'dialog'"
      v-model="item.visible"
      :title="item.title"
      :width="item.width"
      :append-to-body="item.appendToBody"
      :destroy-on-close="item.destroyOnClose"
      :close-on-click-modal="item.closeOnClickModal"
      :close-on-press-escape="item.closeOnPressEscape"
      :show-close="item.showClose"
      :class="getDialogClass(item)"
      :before-close="getBeforeCloseHandler(item)"
      @close="onClose(item)"
      @closed="onClosed(item)"
    >
      <template v-if="item.headerRenderer" #header>
        <RenderSlot :renderer="item.headerRenderer" :context="buildRenderContext(item)" />
      </template>

      <RenderSlot
        v-if="item.contentRenderer"
        :renderer="item.contentRenderer"
        :context="buildRenderContext(item)"
      />
      <component :is="item.component" v-else-if="item.component" v-bind="item.componentProps" />

      <template v-if="hasFooter(item)" #footer>
        <RenderSlot
          v-if="item.footerRenderer"
          :renderer="item.footerRenderer"
          :context="buildRenderContext(item)"
        />
        <div v-else class="ob-dialog-host__footer">
          <el-button v-if="item.showCancelButton" @click="handleCancel(item)">
            {{ item.cancelText }}
          </el-button>
          <el-button
            v-if="item.showConfirmButton"
            type="primary"
            :loading="item.loading || item.confirming"
            @click="handleConfirm(item)"
          >
            {{ item.confirmText }}
          </el-button>
        </div>
      </template>
    </el-dialog>

    <el-drawer
      v-else
      v-model="item.visible"
      :title="item.title"
      :size="item.size"
      :append-to-body="item.appendToBody"
      :destroy-on-close="item.destroyOnClose"
      :close-on-click-modal="item.closeOnClickModal"
      :close-on-press-escape="item.closeOnPressEscape"
      :show-close="item.showClose"
      :class="getDrawerClass(item)"
      :before-close="getBeforeCloseHandler(item)"
      @close="onClose(item)"
      @closed="onClosed(item)"
    >
      <template v-if="item.headerRenderer" #header>
        <RenderSlot :renderer="item.headerRenderer" :context="buildRenderContext(item)" />
      </template>

      <RenderSlot
        v-if="item.contentRenderer"
        :renderer="item.contentRenderer"
        :context="buildRenderContext(item)"
      />
      <component :is="item.component" v-else-if="item.component" v-bind="item.componentProps" />

      <template v-if="hasFooter(item)" #footer>
        <RenderSlot
          v-if="item.footerRenderer"
          :renderer="item.footerRenderer"
          :context="buildRenderContext(item)"
        />
        <div v-else class="ob-dialog-host__footer">
          <el-button v-if="item.showCancelButton" @click="handleCancel(item)">
            {{ item.cancelText }}
          </el-button>
          <el-button
            v-if="item.showConfirmButton"
            type="primary"
            :loading="item.loading || item.confirming"
            @click="handleConfirm(item)"
          >
            {{ item.confirmText }}
          </el-button>
        </div>
      </template>
    </el-drawer>
  </template>
</template>

<style scoped>
.ob-dialog-host__footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
</style>
