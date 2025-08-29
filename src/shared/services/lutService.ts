import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LUT_ROOT = path.join(__dirname, "..", "luts");

export async function loadLut<T=unknown>(file: string): Promise<T> {
  const p = path.join(LUT_ROOT, file);
  const raw = await fs.readFile(p, "utf-8");
  return JSON.parse(raw) as T;
}
