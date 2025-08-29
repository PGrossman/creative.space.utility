import { contextBridge, ipcRenderer } from "electron";
import { CalcRequest, CalcRequest as CalcReqType } from "./ipc-schema";

contextBridge.exposeInMainWorld("api", {
  calc: async (req: CalcReqType) => {
    const parsed = CalcRequest.safeParse(req);
    if (!parsed.success) throw new Error(parsed.error.message);
    return ipcRenderer.invoke("calc:run", parsed.data);
  }
});

export type PreloadAPI = typeof window.api;
declare global {
  interface Window { api: PreloadAPI; }
}
