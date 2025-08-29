import { app, BrowserWindow, ipcMain } from "electron";
import path from "node:path";
import { fileURLToPath } from "node:url";
import isDev from "electron-is-dev";
import { registerAppMenu } from "./app-menu.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
let win: BrowserWindow | null = null;

async function createWindow() {
  win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      contextIsolation: true,
      preload: path.join(__dirname, "../preload/preload.js"),
      nodeIntegration: false,
      sandbox: true
    },
    title: "creative.space.utility"
  });

  registerAppMenu();

  if (isDev) {
    await win.loadURL("http://localhost:5173");
    win.webContents.openDevTools({ mode: "detach" });
  } else {
    await win.loadFile(path.join(__dirname, "../../dist/index.html"));
  }

  win.on("closed", () => (win = null));
}

app.whenReady().then(createWindow);
app.on("window-all-closed", () => { if (process.platform !== "darwin") app.quit(); });
app.on("activate", () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });

// IPC (pure calculation calls routed via modules in src/shared/modules/*)
ipcMain.handle("calc:run", async (_e, { module, fn, payload }) => {
  try {
    const mod = await import(`../shared/modules/${module}/index.js`);
    if (!mod?.[fn]) throw new Error(`Function ${fn} not found in module ${module}`);
    return await mod[fn](payload);
  } catch (error) {
    console.error(`IPC error in module ${module}, function ${fn}:`, error);
    throw error;
  }
});
