import { loadLut } from "../../services/lutService.js";
import type { BitrateInput, BitrateResult } from "./bitrate.types.js";

export async function estimateBitrate(input: BitrateInput): Promise<BitrateResult> {
  const resMap = await loadLut<Record<string, {width:number;height:number;fps:number}>>("example-media-map.json");
  const codecTable = await loadLut<Record<string, {name:string;multiplier:number}>>("example-codec-table.json");

  const res = resMap[input.resolutionKey];
  const codec = codecTable[input.codec];
  if (!res || !codec) throw new Error("Invalid codec or resolution");

  // Extremely simple placeholder formula: pixels * fps * codec multiplier * constant
  const base = (res.width * res.height * res.fps) / 1e6; // megapixels*fps
  const mbps = base * 2.5 * codec.multiplier;            // tune constant later with true LUTs
  const seconds = input.minutes * 60;
  const gb = (mbps * 1_000_000 / 8) * seconds / (1024 ** 3);
  return { mbps, gb };
}
