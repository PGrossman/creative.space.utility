import pkg from "electron";
const { app, BrowserWindow, ipcMain } = pkg;
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { registerAppMenu } from "./app-menu.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
let win: any = null;

// Check if we're in development mode
const isDev = process.env.VITE_DEV_SERVER === "true";

// Get the correct app path
const getAppPath = () => {
  if (isDev) {
    return __dirname;
  }
  // In production, check if we're in an asar bundle
  return app.isPackaged ? process.resourcesPath : __dirname;
};

async function createWindow() {
  const appPath = getAppPath();
  
  win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      contextIsolation: true,
      // FIXED: Correct preload path for both dev and production
      preload: isDev 
        ? path.join(__dirname, "../preload/preload.js")
        : path.join(appPath, app.isPackaged ? "app.asar" : "", "preload.js"),
      nodeIntegration: false,
      sandbox: false,
      webSecurity: !isDev
    },
    title: "creative.space.utility"
  });

  registerAppMenu();

  if (isDev) {
    await win.loadURL("http://localhost:5173");
    win.webContents.openDevTools({ mode: "detach" });
  } else {
    // FIXED: Correct HTML path for production
    const htmlPath = app.isPackaged 
      ? path.join(appPath, "app.asar", "renderer", "index.html")
      : path.join(__dirname, "../renderer/index.html");
    await win.loadFile(htmlPath);
  }

  win.on("closed", () => {
    win = null;
    app.quit();
  });
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  app.quit();
});

app.on("activate", () => {
  // macOS specific behavior
});

// IPC handler for calculator modules
ipcMain.handle("calc:run", async (_e, { module, fn, payload }) => {
  try {
    const appPath = getAppPath();
    
    // FIXED: Correct module path resolution
    let modulePath: string;
    if (isDev) {
      modulePath = path.join(__dirname, "../shared/modules", module, "index.js");
    } else if (app.isPackaged) {
      // In packaged app, modules are unpacked for dynamic loading
      modulePath = path.join(appPath, "app.asar.unpacked", "shared", "modules", module, "index.js");
    } else {
      modulePath = path.join(__dirname, "shared/modules", module, "index.js");
    }

    console.log(`Loading module from: ${modulePath}`);
    
    const mod = await import(pathToFileURL(modulePath).href);
    const impl = (mod as any)[fn] ?? (mod as any).default?.[fn];
    
    if (typeof impl !== "function") {
      throw new Error(`Function ${fn} not found in module ${module}`);
    }
    
    const result = await impl(payload);
    console.log(`Calculator ${module}.${fn} executed successfully`);
    return result;
  } catch (err) {
    console.error("calc:run error", err);
    throw err;
  }
});
