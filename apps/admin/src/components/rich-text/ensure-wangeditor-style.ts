let loadWangEditorStyleTask: Promise<void> | null = null;

export function ensureWangEditorStyle() {
  if (loadWangEditorStyleTask) {
    return loadWangEditorStyleTask;
  }

  loadWangEditorStyleTask = import('@wangeditor/editor/dist/css/style.css')
    .then(() => undefined)
    .catch((error) => {
      loadWangEditorStyleTask = null;
      throw error;
    });

  return loadWangEditorStyleTask;
}
