import { onBeforeUnmount, onMounted } from 'vue'

import type { CreatePageEditorControllerOptions } from './page-editor-controller'
import { createPageEditorController } from './page-editor-controller'

export function usePageEditorWorkbench(options: CreatePageEditorControllerOptions) {
  const controller = createPageEditorController(options)

  onMounted(() => {
    controller.mount()
  })

  onBeforeUnmount(() => {
    controller.dispose()
  })

  return controller
}
