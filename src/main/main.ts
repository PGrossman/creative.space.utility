import { app, BrowserWindow, ipcMain } from "electron";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { registerAppMenu } from "./app-menu.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
let win: BrowserWindow | null = null;

// Check if we're in development mode by looking for the dev server
const isDev = process.env.VITE_DEV_SERVER === "true";

async function createWindow() {
  win = new BrowserWindow({
    width: 1200,
    height: 800,
          webPreferences: {
        contextIsolation: true,
        preload: path.join(__dirname, "../preload/preload.js"),
        nodeIntegration: false,
        sandbox: false
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

  win.on("closed", () => {
    win = null;
    app.quit();   // force quit when window is closed
  });
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  // Quit on all platforms
  app.quit();
});

app.on("activate", () => {
  // On mac, normally you'd re-open — but since you want quit-on-close,
  // you can leave this empty or just log if needed.
});

// IPC (pure calculation calls routed via modules in src/shared/modules/*)
ipcMain.handle("calc:run", async (_e, { module, fn, payload }) => {
  try {
    const target = path.join(__dirname, "../shared/modules", module, "index.js");
    const mod = await import(pathToFileURL(target).href);
    const impl = (mod as any)[fn] ?? (mod as any).default?.[fn];
    if (typeof impl !== "function") {
      throw new Error(`Function ${fn} not found in module ${module}`);
    }
    return await impl(payload);
  } catch (err) {
    console.error("calc:run error", err);
    throw err;
  }
});
