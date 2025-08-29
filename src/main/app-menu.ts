import { Menu } from "electron";

export function registerAppMenu() {
  const template = [
    { label: "App", submenu: [{ role: "about" }, { type: "separator" }, { role: "quit" }] },
    { label: "Edit", submenu: [{ role: "copy" }, { role: "paste" }, { role: "selectAll" }] },
    { label: "View", submenu: [{ role: "reload" }, { role: "toggleDevTools" }, { role: "resetZoom" }] }
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template as any));
}
