// src/shared/modules/storageCapacity/index.ts
// ZFS capacity/perf calculator for RAIDZ1/Z2/Z3 (+ summary)

export type RaidType = "RAIDZ1" | "RAIDZ2" | "RAIDZ3";

export type CapacityInput = {
  raidType: RaidType;
  drivesPerVdev: number;   // e.g., 6
  vdevs: number;           // e.g., 1
  driveSizeTb: number;     // 16 | 20 | 24  (decimal TB)
  driveSpeedMBs: number;   // e.g., 225 MB/s per drive
  zfsOverheadPct: number;  // 0..1 (e.g., 0.20)
};

export type CapacityResult = {
  // capacities (TB)
  rawTb: number;
  parityTb: number;
  zfsOverheadTb: number;
  usableTbBeforeZfs: number;
  usableTb: number;

  // perf (GB/s)
  readGBs: number;
  arcGBs: number;
  writeGBs: number;

  // drive breakdown
  totalDrives: number;
  dataDrives: number;
  parityDrives: number;

  // text
  protection: string;
};

// simple constants (heuristics)
const WRITE_PENALTY = 0.80; // write penalty factor on sequential
const ARC_BOOST = 1.18;     // read cache uplift for ARC (illustrative only)

function parityPerVdev(raid: RaidType): number {
  return raid === "RAIDZ1" ? 1 : raid === "RAIDZ2" ? 2 : 3;
}

export function calcCapacity(i: CapacityInput): CapacityResult {
  const parity = parityPerVdev(i.raidType);
  if (i.drivesPerVdev <= parity) {
    throw new Error(`Drives per VDEV must be greater than parity (${parity}) for ${i.raidType}.`);
  }

  const totalDrives = i.drivesPerVdev * i.vdevs;
  const dataPerVdev = i.drivesPerVdev - parity;
  const dataDrives  = dataPerVdev * i.vdevs;
  const parityDrives = parity * i.vdevs;

  const rawTb = totalDrives * i.driveSizeTb;
  const parityTb = parityDrives * i.driveSizeTb;
  const usableTbBeforeZfs = dataDrives * i.driveSizeTb;
  const zfsOverheadTb = usableTbBeforeZfs * i.zfsOverheadPct;
  const usableTb = usableTbBeforeZfs - zfsOverheadTb;

  // perf (very simple sequential heuristics)
  const readGBs  = (dataDrives * i.driveSpeedMBs) / 1024;
  const arcGBs   = readGBs * ARC_BOOST;
  const writeGBs = (dataDrives * i.driveSpeedMBs * WRITE_PENALTY) / 1024;

  const protection = `Can survive ${parity} drive${parity > 1 ? "s" : ""} per vdev`;

  return {
    rawTb,
    parityTb,
    zfsOverheadTb,
    usableTbBeforeZfs,
    usableTb,
    readGBs,
    arcGBs,
    writeGBs,
    totalDrives,
    dataDrives,
    parityDrives,
    protection
  };
}

// Export shape for Electron dynamic import dispatch
export default { calcCapacity };
export { calcCapacity as run };
