const { contextBridge, ipcRenderer } = require("electron");
import { CalcRequest } from "./ipc-schema";

interface PreloadAPI {
  calc: (req: CalcRequest) => Promise<unknown>;
}

contextBridge.exposeInMainWorld("api", {
  calc: async (req: CalcRequest) => {
    const parsed = CalcRequest.safeParse(req);
    if (!parsed.success) throw new Error(parsed.error.message);
    return ipcRenderer.invoke("calc:run", parsed.data);
  }
} as PreloadAPI);

declare global {
  interface Window { api: PreloadAPI; }
}
