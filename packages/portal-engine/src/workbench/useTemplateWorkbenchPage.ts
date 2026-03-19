import type { CreateTemplateWorkbenchPageControllerOptions } from './template-workbench-page-controller';
import { createTemplateWorkbenchPageController } from './template-workbench-page-controller';

export function useTemplateWorkbenchPage(options: CreateTemplateWorkbenchPageControllerOptions) {
  return createTemplateWorkbenchPageController(options);
}
