import { contextBridge, ipcRenderer } from "electron";

/**
 * Minimal, stable bridge. NO external imports (e.g., no "ipc-schema").
 * Exposes a single "calc" entrypoint that calls main via ipcRenderer.invoke.
 */
contextBridge.exposeInMainWorld("api", {
  calc: (req: { module: string; fn: string; payload: unknown }) =>
    ipcRenderer.invoke("calc:run", req),
});

declare global {
  interface Window {
    api: {
      calc(req: { module: string; fn: string; payload: unknown }): Promise<any>;
    };
  }
}
