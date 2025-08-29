import { describe, it, expect } from "vitest";
import { estimateBitrate } from "./bitrate.calculator";

describe("estimateBitrate", () => {
  it("computes a value", async () => {
    const out = await estimateBitrate({ codec: "prores_422_hq", resolutionKey: "1080p29.97", minutes: 1 });
    expect(out.mbps).toBeGreaterThan(1);
    expect(out.gb).toBeGreaterThan(0);
  });
});
