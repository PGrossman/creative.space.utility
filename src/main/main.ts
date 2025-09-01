import { app, BrowserWindow, ipcMain } from "electron";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
let win: BrowserWindow | null = null;

async function createWindow() {
  win = new BrowserWindow({
    width: 1280,
    height: 900,
    title: "creative.space.utility",
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false, // Allow ESM preload without sandbox bundling errors
      preload: path.join(__dirname, "../preload/preload.js")
    }
  });

  if (process.env.VITE_DEV_SERVER) {
    await win.loadURL("http://localhost:5173");
  } else {
    await win.loadFile(path.join(__dirname, "../../dist/index.html"));
  }

  // Quit the entire app when the window closes (macOS included)
  win.on("closed", () => {
    win = null;
    app.quit();
  });
}

app.whenReady().then(createWindow);

// Quit when all windows are closed (macOS included)
app.on("window-all-closed", () => app.quit());

// No-op on activate; we quit on close
app.on("activate", () => {});

// IPC dispatcher: dynamic import of compiled shared modules
ipcMain.handle("calc:run", async (_e, { module, fn, payload }) => {
  const target = path.join(__dirname, "../shared/modules", module, "index.js");
  const mod = await import(pathToFileURL(target).href);
  const impl = (mod as any)[fn] ?? (mod as any).default?.[fn];
  if (typeof impl !== "function") {
    throw new Error(`Function ${fn} not found in module ${module}`);
  }
  return await impl(payload);
});
