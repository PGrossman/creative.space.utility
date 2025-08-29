import { describe, it, expect } from "vitest";
import { streamsForAllLinks, gbPerHour, timeOnOneTBHours } from "./index";

describe("streamCalc", () => {
  it("calculates streams for all network links", () => {
    const mbpsPerStream = 50;
    const result = streamsForAllLinks(mbpsPerStream);

    expect(result).toHaveLength(6); // 1G, 10G, 25G, 40G, 50G, 100G
    expect(result[0].nic).toBe("1G");
    expect(result[0].streams).toBeGreaterThan(0);
    expect(result[1].nic).toBe("10G");
    expect(result[1].streams).toBeGreaterThan(result[0].streams); // 10G should support more streams
  });

  it("calculates GB per hour correctly", () => {
    const mbps = 100;
    const result = gbPerHour(mbps);
    
    // 100 Mbps = 12.5 MB/s = 43.9453125 GB/hour
    expect(result).toBeCloseTo(43.95, 1);
  });

  it("calculates time on 1 TB correctly", () => {
    const mbps = 100;
    const result = timeOnOneTBHours(mbps);
    
    // 100 Mbps fills 1 TB in about 23.3 hours
    expect(result).toBeCloseTo(23.3, 1);
  });
});
