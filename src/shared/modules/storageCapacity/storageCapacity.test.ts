import { describe, it, expect } from "vitest";
import { calcCapacity } from "./index";

describe("calcCapacity", () => {
  it("calculates RAIDZ2 configuration correctly", () => {
    const input = {
      raidType: "RAIDZ2" as const,
      drivesPerVdev: 6,
      vdevs: 1,
      driveSizeTb: 18,
      driveSpeedMBs: 250,
      zfsOverheadPct: 0.12
    };

    const result = calcCapacity(input);

    expect(result.rawTb).toBe(108); // 6 * 18
    expect(result.usableTb).toBe(72); // (6-2) * 18
    expect(result.usableAfterZfsTb).toBe(63.36); // 72 * (1-0.12)
    expect(result.dataDrives).toBe(4); // 6-2
    expect(result.parityDrives).toBe(2); // 2
    expect(result.readGBs).toBeGreaterThan(0);
    expect(result.writeGBs).toBeGreaterThan(0);
    expect(result.protection).toContain("Can survive 2 drives per vdev");
  });

  it("calculates MIRROR configuration correctly", () => {
    const input = {
      raidType: "MIRROR" as const,
      drivesPerVdev: 4,
      vdevs: 2,
      driveSizeTb: 18,
      driveSpeedMBs: 250,
      zfsOverheadPct: 0.10
    };

    const result = calcCapacity(input);

    expect(result.rawTb).toBe(144); // 4 * 2 * 18
    expect(result.usableTb).toBe(72); // (4/2) * 2 * 18
    expect(result.dataDrives).toBe(4); // (4/2) * 2
    expect(result.parityDrives).toBe(4); // (4/2) * 2
    expect(result.protection).toContain("Can survive 1 drive per mirror pair");
  });
});
