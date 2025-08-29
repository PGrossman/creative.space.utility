import { LINK_GBPS, SAFE_LINK_UTIL } from "../../constants.js";

export type StreamsTable = { nic: keyof typeof LINK_GBPS; streams: number }[];

export function streamsForAllLinks(mbpsPerStream: number): StreamsTable {
  return (Object.keys(LINK_GBPS) as (keyof typeof LINK_GBPS)[])
    .map(nic => {
      const gbpsAvail = LINK_GBPS[nic] * SAFE_LINK_UTIL;
      const streams = Math.floor((gbpsAvail * 1000) / mbpsPerStream);
      return { nic, streams };
    });
}

export function gbPerHour(mbps: number): number {
  return (mbps / 8) * 3600 / 1024; // GB/hr
}

export function timeOnOneTBHours(mbps: number): number {
  const gbhr = gbPerHour(mbps);
  return 1024 / gbhr; // hours on 1 TiB
}
