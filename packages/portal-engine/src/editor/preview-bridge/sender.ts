import {
  buildPreviewRuntimeMessage,
  buildPreviewShellDetailsMessage,
  buildPreviewViewportMessage,
  type PortalPreviewRuntimeData,
  type PortalPreviewShellDetailsData,
  type PortalPreviewViewportData
} from './messages';

export interface PortalPreviewFrameTarget {
  postMessageToFrame: (message: unknown) => boolean;
}

function sendToPreviewFrame(
  target: PortalPreviewFrameTarget | null | undefined,
  message: unknown
): boolean {
  if (!target || typeof target.postMessageToFrame !== 'function') {
    return false;
  }
  return target.postMessageToFrame(message);
}

export function sendPreviewShellDetails(
  target: PortalPreviewFrameTarget | null | undefined,
  data: PortalPreviewShellDetailsData
): boolean {
  return sendToPreviewFrame(target, buildPreviewShellDetailsMessage(data));
}

export function sendPreviewViewport(
  target: PortalPreviewFrameTarget | null | undefined,
  data: PortalPreviewViewportData
): boolean {
  return sendToPreviewFrame(target, buildPreviewViewportMessage(data));
}

export function sendPreviewRuntime(
  target: PortalPreviewFrameTarget | null | undefined,
  data: PortalPreviewRuntimeData
): boolean {
  return sendToPreviewFrame(target, buildPreviewRuntimeMessage(data));
}

export function sendPreviewPageRuntimeToWindow(
  target: Window | null | undefined,
  payload: {
    origin: string;
    data: PortalPreviewRuntimeData;
  }
): boolean {
  if (!target || typeof target.postMessage !== 'function') {
    return false;
  }

  try {
    target.postMessage(buildPreviewRuntimeMessage(payload.data), payload.origin);
    return true;
  } catch {
    return false;
  }
}
