import { LINK_GBPS, SAFE_LINK_UTIL } from "../../constants.js";

export type PerfInput = { 
  mbpsPerStream: number; 
  users: number; 
  readsPerUser: number; 
  writesPerUser: number; 
  nic: keyof typeof LINK_GBPS; 
};

export type PerfResult = { 
  totalMbps: number; 
  totalGbps: number; 
  linkGbps: number; 
  utilPct: number; 
};

export function calcBandwidthNeeds(i: PerfInput): PerfResult {
  const totalStreams = i.users * (i.readsPerUser + i.writesPerUser);
  const totalMbps = totalStreams * i.mbpsPerStream;
  const totalGbps = totalMbps / 1000;
  const linkGbps = LINK_GBPS[i.nic] * SAFE_LINK_UTIL;
  const utilPct = Math.min(100, (totalGbps / linkGbps) * 100);
  return { totalMbps, totalGbps, linkGbps, utilPct };
}
