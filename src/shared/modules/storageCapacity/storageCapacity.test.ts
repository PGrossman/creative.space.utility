import { describe, it, expect } from "vitest";
import { calcCapacity } from "./index";

describe("calcCapacity (Z2, 6x16TB, 1 vdev, 225MB/s, 20%)", () => {
  it("computes sane values", () => {
    const out = calcCapacity({
      raidType: "RAIDZ2",
      drivesPerVdev: 6,
      vdevs: 1,
      driveSizeTb: 16,
      driveSpeedMBs: 225,
      zfsOverheadPct: 0.20
    });
    expect(out.totalDrives).toBe(6);
    expect(out.parityDrives).toBe(2);
    expect(out.dataDrives).toBe(4);
    expect(out.rawTb).toBeCloseTo(96, 5);
    expect(out.usableTbBeforeZfs).toBeCloseTo(64, 5);
    expect(out.usableTb).toBeCloseTo(51.2, 3); // 64 - 20%
  });
});

describe("calcCapacity (Z1, 4x20TB, 2 vdevs, 250MB/s, 15%)", () => {
  it("computes multi-vdev values", () => {
    const out = calcCapacity({
      raidType: "RAIDZ1",
      drivesPerVdev: 4,
      vdevs: 2,
      driveSizeTb: 20,
      driveSpeedMBs: 250,
      zfsOverheadPct: 0.15
    });
    expect(out.totalDrives).toBe(8);
    expect(out.parityDrives).toBe(2);
    expect(out.dataDrives).toBe(6);
    expect(out.rawTb).toBeCloseTo(160, 5);
    expect(out.usableTbBeforeZfs).toBeCloseTo(120, 5);
    expect(out.usableTb).toBeCloseTo(102, 3); // 120 - 15%
  });
});
