export const LINK_GBPS = { "1G": 1.25, "10G": 12.5, "25G": 31.25, "40G": 50, "50G": 62.5, "100G": 125 } as const;
export const SAFE_LINK_UTIL = 0.80;   // plan at 80% link utilization
export const RAID_PARITY = { RAIDZ1: 1, RAIDZ2: 2, RAIDZ3: 3, MIRROR: 1, RAID0: 0 } as const;
export const WRITE_PENALTY = 0.80;    // simple write overhead
export const ARC_BOOST = 1.18;        // read cache effect (heuristic)
