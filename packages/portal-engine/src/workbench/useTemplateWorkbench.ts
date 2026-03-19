import type { CreateTemplateWorkbenchControllerOptions } from './template-workbench-controller';
import { createTemplateWorkbenchController } from './template-workbench-controller';

export function useTemplateWorkbench(options: CreateTemplateWorkbenchControllerOptions) {
  return createTemplateWorkbenchController(options);
}
