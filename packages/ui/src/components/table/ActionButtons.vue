<script setup lang="ts">
import { MoreFilled } from '@element-plus/icons-vue'
import {
  Comment,
  Fragment,
  Text,
  computed,
  defineComponent,
  type PropType,
  type VNode,
  useSlots
} from 'vue'

defineOptions({
  name: 'ActionButtons'
})

interface ActionNode {
  key: string
  vnode: VNode
  label: string
  isDelete: boolean
  disabled: boolean
  onClick?: (event: MouseEvent) => void
}

const slots = useSlots()

const MAX_VISIBLE_ACTIONS = 4
const MAX_VISIBLE_WHEN_OVERFLOW = 3

function normalizeClickHandler(handler: unknown): ((event: MouseEvent) => void) | undefined {
  if (Array.isArray(handler)) {
    return (event: MouseEvent) => {
      handler.forEach((item) => {
        if (typeof item === 'function') {
          item(event)
        }
      })
    }
  }

  if (typeof handler === 'function') {
    return handler as (event: MouseEvent) => void
  }

  return undefined
}

function extractSlotNodes(nodes: VNode[] = []): VNode[] {
  return nodes.flatMap((node) => {
    if (!node) return []

    if (node.type === Fragment && Array.isArray(node.children)) {
      return extractSlotNodes(node.children as VNode[])
    }

    if (node.type === Comment) return []

    if (node.type === Text) {
      const text = String(node.children ?? '').trim()
      return text ? [node] : []
    }

    if (typeof node.type === 'string' && Array.isArray(node.children)) {
      return extractSlotNodes(node.children as VNode[])
    }

    return [node]
  })
}

function extractNodeText(node: VNode): string {
  if (typeof node.children === 'string') {
    return node.children.trim()
  }

  if (Array.isArray(node.children)) {
    return node.children
      .map((child) => extractNodeText(child as VNode))
      .join('')
      .trim()
  }

  if (node.children && typeof node.children === 'object' && 'default' in node.children) {
    const defaultSlot = (node.children as { default?: () => VNode[] }).default
    if (typeof defaultSlot === 'function') {
      return extractSlotNodes(defaultSlot())
        .map((child) => extractNodeText(child))
        .join('')
        .trim()
    }
  }

  return ''
}

function normalizeClassName(value: unknown): string {
  if (!value) return ''
  if (typeof value === 'string') return value
  if (Array.isArray(value)) {
    return value.map((item) => normalizeClassName(item)).join(' ')
  }
  if (typeof value === 'object') {
    return Object.entries(value as Record<string, unknown>)
      .filter(([, enabled]) => Boolean(enabled))
      .map(([name]) => name)
      .join(' ')
  }
  return ''
}

function isDeleteAction(node: VNode, label: string): boolean {
  const props = (node.props ?? {}) as Record<string, unknown>
  if (props['data-action'] === 'delete') return true
  if (String(props.type || '').toLowerCase() === 'danger') return true
  if (normalizeClassName(props.class).toLowerCase().includes('danger')) return true
  return label.includes('删除')
}

function resolveActionNodes(): ActionNode[] {
  const rawNodes = extractSlotNodes(slots.default?.() ?? [])
    .filter((node) => node.type !== Text)

  return rawNodes.map((node, index) => {
    const props = (node.props ?? {}) as Record<string, unknown>
    const label = extractNodeText(node)

    return {
      key: `action-${index}-${label || 'untitled'}`,
      vnode: node,
      label,
      isDelete: isDeleteAction(node, label),
      disabled: Boolean(props.disabled),
      onClick: normalizeClickHandler(props.onClick)
    }
  })
}

const orderedActions = computed<ActionNode[]>(() => {
  const actions = [...resolveActionNodes()]
  const deleteActions = actions.filter((action) => action.isDelete)
  if (deleteActions.length === 0) return actions
  const normalActions = actions.filter((action) => !action.isDelete)
  return [...normalActions, ...deleteActions]
})

const visibleActions = computed<ActionNode[]>(() => {
  const actions = orderedActions.value
  if (actions.length <= MAX_VISIBLE_ACTIONS) {
    return actions
  }

  const deleteAction = actions.find((action) => action.isDelete)
  if (!deleteAction) {
    return actions.slice(0, MAX_VISIBLE_WHEN_OVERFLOW)
  }

  const nonDeleteActions = actions.filter((action) => !action.isDelete)
  return [...nonDeleteActions.slice(0, MAX_VISIBLE_WHEN_OVERFLOW - 1), deleteAction]
})

const overflowActions = computed<ActionNode[]>(() => {
  const visibleKeySet = new Set(visibleActions.value.map((action) => action.key))
  return orderedActions.value.filter((action) => !visibleKeySet.has(action.key))
})

const VNodeRenderer = defineComponent({
  name: 'ActionVNodeRenderer',
  props: {
    node: {
      type: Object as PropType<VNode>,
      required: true
    }
  },
  setup(props) {
    return () => props.node
  }
})

function handleOverflowCommand(command: string) {
  const action = overflowActions.value.find((item) => item.key === command)
  if (!action || action.disabled || !action.onClick) return
  action.onClick(new MouseEvent('click'))
}
</script>

<template>
  <div class="ob-action-buttons" @click.stop>
    <VNodeRenderer
      v-for="action in visibleActions"
      :key="action.key"
      :node="action.vnode"
    />

    <el-dropdown
      v-if="overflowActions.length > 0"
      trigger="hover"
      placement="bottom-end"
      :show-timeout="0"
      :hide-timeout="120"
      @command="handleOverflowCommand"
    >
      <el-button
        link
        type="primary"
        class="ob-action-buttons__more"
        :icon="MoreFilled"
        aria-label="更多操作"
        @click.stop
        @mouseenter.stop
      />
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item
            v-for="action in overflowActions"
            :key="action.key"
            :command="action.key"
            :disabled="action.disabled"
          >
            {{ action.label || '更多操作' }}
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
</template>

<style scoped>
.ob-action-buttons {
  display: inline-flex;
  align-items: center;
  gap: 2px;
}

.ob-action-buttons :deep(.el-button + .el-button) {
  margin-left: 0;
}

.ob-action-buttons__more {
  min-width: 24px;
  min-height: 24px;
  padding: 0 4px;
}
</style>
