import { describe, it, expect } from "vitest";
import { calcBandwidthNeeds } from "./index";

describe("calcBandwidthNeeds", () => {
  it("calculates bandwidth needs for 10G network", () => {
    const input = {
      mbpsPerStream: 50,
      users: 10,
      readsPerUser: 2,
      writesPerUser: 1,
      nic: "10G" as const
    };

    const result = calcBandwidthNeeds(input);

    expect(result.totalMbps).toBe(1500); // 10 * (2+1) * 50
    expect(result.totalGbps).toBe(1.5); // 1500 / 1000
    expect(result.linkGbps).toBe(10); // 12.5 * 0.8
    expect(result.utilPct).toBe(15); // (1.5 / 10) * 100
  });

  it("calculates high utilization scenario", () => {
    const input = {
      mbpsPerStream: 100,
      users: 20,
      readsPerUser: 3,
      writesPerUser: 2,
      nic: "1G" as const
    };

    const result = calcBandwidthNeeds(input);

    expect(result.totalMbps).toBe(10000); // 20 * (3+2) * 100
    expect(result.totalGbps).toBe(10); // 10000 / 1000
    expect(result.linkGbps).toBe(1); // 1.25 * 0.8
    expect(result.utilPct).toBe(100); // capped at 100%
  });
});
