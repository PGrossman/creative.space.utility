import { RAID_PARITY, WRITE_PENALTY, ARC_BOOST } from "../../constants.js";

export type CapacityInput = {
  raidType: keyof typeof RAID_PARITY | "MIRROR" | "RAID0";
  drivesPerVdev: number;
  vdevs: number;
  driveSizeTb: number;     // decimal TB
  driveSpeedMBs: number;   // per-disk sequential MB/s
  zfsOverheadPct: number;  // 0..1
};

export type CapacityResult = {
  rawTb: number;
  usableTb: number;        // after parity
  usableAfterZfsTb: number;
  readGBs: number;
  writeGBs: number;
  arcGBs: number;
  dataDrives: number;
  parityDrives: number;
  protection: string;
};

export function calcCapacity(i: CapacityInput): CapacityResult {
  const parityPerVdev = i.raidType === "MIRROR" ? i.drivesPerVdev / 2 : (RAID_PARITY as any)[i.raidType] ?? 0;
  const dataPerVdev = i.raidType === "MIRROR" ? i.drivesPerVdev / 2 : i.drivesPerVdev - parityPerVdev;
  const dataDrives = dataPerVdev * i.vdevs;
  const parityDrives = parityPerVdev * i.vdevs;

  const rawTb = i.driveSizeTb * (i.drivesPerVdev * i.vdevs);
  const usableTb = dataDrives * i.driveSizeTb;
  const usableAfterZfsTb = usableTb * (1 - i.zfsOverheadPct);

  const readGBs = (dataDrives * i.driveSpeedMBs) / 1024;
  const writeGBs = ((dataDrives) * i.driveSpeedMBs * WRITE_PENALTY) / 1024;
  const arcGBs = readGBs * ARC_BOOST;

  let protection = "No redundancy";
  if (i.raidType === "MIRROR") protection = "Can survive 1 drive per mirror pair";
  if (i.raidType.startsWith("RAIDZ")) protection = `Can survive ${parityPerVdev} drive${parityPerVdev>1?"s":""} per vdev`;

  return { rawTb, usableTb, usableAfterZfsTb, readGBs, writeGBs, arcGBs, dataDrives, parityDrives, protection };
}
