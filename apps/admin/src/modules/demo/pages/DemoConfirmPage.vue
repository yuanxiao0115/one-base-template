<script setup lang="ts">
import { computed, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { PageContainer } from '@one-base-template/ui'
import { confirm, type ConfirmTone } from '@/infra/confirm'

defineOptions({
  name: 'DemoConfirmPage'
})

type ConfirmDemoItem = {
  tone: ConfirmTone
  title: string
  content: string
  buttonText: string
}

const activeTone = ref<ConfirmTone | null>(null)
const buttonTypeMap: Record<ConfirmTone, 'success' | 'danger' | 'warning'> = {
  success: 'success',
  error: 'danger',
  warning: 'warning'
}

const demoItems: ConfirmDemoItem[] = [
  {
    tone: 'success',
    title: '成功信息',
    content: '操作即将生效，是否继续提交？',
    buttonText: '成功弹窗'
  },
  {
    tone: 'error',
    title: '失败信息',
    content: '该操作无法撤销，是否仍要继续？',
    buttonText: '失败弹窗'
  },
  {
    tone: 'warning',
    title: '警告信息',
    content: '该操作可能影响关联数据，是否继续？',
    buttonText: '警告弹窗'
  }
]

const loadingMap = computed(() =>
  demoItems.reduce<Record<ConfirmTone, boolean>>(
    (result, item) => {
      result[item.tone] = activeTone.value === item.tone
      return result
    },
    {
      warning: false,
      success: false,
      error: false
    }
  )
)

function isCanceledAction(error: unknown) {
  return error === 'cancel' || error === 'close'
}

async function openConfirm(item: ConfirmDemoItem) {
  if (activeTone.value) return

  activeTone.value = item.tone

  try {
    if (item.tone === 'success') {
      await confirm.success(item.content, item.title)
    } else if (item.tone === 'error') {
      await confirm.error(item.content, item.title)
    } else {
      await confirm.warn(item.content, item.title)
    }

    ElMessage.success(`已确认：${item.title}`)
  } catch (error) {
    if (isCanceledAction(error)) {
      ElMessage.info(`已取消：${item.title}`)
      return
    }

    const message = error instanceof Error ? error.message : '打开确认框失败'
    ElMessage.error(message)
  } finally {
    activeTone.value = null
  }
}
</script>

<template>
  <div class="demo-confirm-page">
    <PageContainer>
      <el-card shadow="never" class="demo-confirm-page__card">
        <template #header>
          <div class="demo-confirm-page__header">
            <div class="demo-confirm-page__title">二次确认弹窗（三色）</div>
            <div class="demo-confirm-page__desc">简单调用：confirm.success / confirm.error / confirm.warn</div>
          </div>
        </template>

        <div class="demo-confirm-page__actions">
          <el-button
            v-for="item in demoItems"
            :key="item.tone"
            :type="buttonTypeMap[item.tone]"
            :loading="loadingMap[item.tone]"
            @click="openConfirm(item)"
          >
            {{ item.buttonText }}
          </el-button>
        </div>
      </el-card>
    </PageContainer>
  </div>
</template>

<style scoped>
.demo-confirm-page {
  height: 100%;
}

.demo-confirm-page__card {
  border-radius: 8px;
}

.demo-confirm-page__header {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.demo-confirm-page__title {
  color: #333333;
  font-size: 16px;
  font-weight: 600;
  line-height: 24px;
}

.demo-confirm-page__desc {
  color: #666666;
  font-size: 14px;
  line-height: 22px;
}

.demo-confirm-page__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}
</style>
