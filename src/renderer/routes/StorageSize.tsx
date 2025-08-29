import React, { useEffect, useState } from "react";
import { Dropdown } from "../components/Dropdown";
import { Card } from "../components/Card";
import type { CapacityInput, CapacityResult } from "../../shared/modules/storageCapacity";

const raidOptions = [
  { label: "RAIDZ1", value: "RAIDZ1" },
  { label: "RAIDZ2", value: "RAIDZ2" },
  { label: "RAIDZ3", value: "RAIDZ3" },
  { label: "MIRROR", value: "MIRROR" },
  { label: "RAID0", value: "RAID0" }
];

export default function StorageSize() {
  const [input, setInput] = useState<CapacityInput>({
    raidType: "RAIDZ2",
    drivesPerVdev: 6,
    vdevs: 1,
    driveSizeTb: 18,
    driveSpeedMBs: 250,
    zfsOverheadPct: 0.12
  });

  const [result, setResult] = useState<CapacityResult | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const out = await window.api.calc({ 
          module: "storageCapacity", 
          fn: "calcCapacity", 
          payload: input 
        }) as CapacityResult;
        setResult(out);
      } catch (error) {
        console.error("Calculation error:", error);
      }
    })();
  }, [input]);

  const updateInput = (key: keyof CapacityInput, value: number | string) => {
    setInput(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left Column - Inputs */}
      <div className="space-y-4">
        <Card title="RAID Configuration">
          <div className="space-y-3">
            <Dropdown 
              label="RAID Type" 
              value={input.raidType} 
              options={raidOptions} 
              onChange={(v) => updateInput("raidType", v)} 
            />
            <label className="flex items-center gap-2">
              <span className="w-40">Drives per VDEV</span>
              <input
                type="number"
                className="border rounded p-2 w-24"
                value={input.drivesPerVdev}
                onChange={(e) => updateInput("drivesPerVdev", parseInt(e.target.value))}
                min="1"
              />
            </label>
            <label className="flex items-center gap-2">
              <span className="w-40">Number of VDEVs</span>
              <input
                type="number"
                className="border rounded p-2 w-24"
                value={input.vdevs}
                onChange={(e) => updateInput("vdevs", parseInt(e.target.value))}
                min="1"
              />
            </label>
            <label className="flex items-center gap-2">
              <span className="w-40">Drive Size (TB)</span>
              <input
                type="number"
                className="border rounded p-2 w-24"
                value={input.driveSizeTb}
                onChange={(e) => updateInput("driveSizeTb", parseFloat(e.target.value))}
                min="0.1"
                step="0.1"
              />
            </label>
            <label className="flex items-center gap-2">
              <span className="w-40">Drive Speed (MB/s)</span>
              <input
                type="number"
                className="border rounded p-2 w-24"
                value={input.driveSpeedMBs}
                onChange={(e) => updateInput("driveSpeedMBs", parseInt(e.target.value))}
                min="1"
              />
            </label>
            <label className="flex items-center gap-2">
              <span className="w-40">ZFS Overhead (%)</span>
              <input
                type="range"
                className="flex-1"
                min="0"
                max="0.30"
                step="0.01"
                value={input.zfsOverheadPct}
                onChange={(e) => updateInput("zfsOverheadPct", parseFloat(e.target.value))}
              />
              <span className="w-16 text-sm">{(input.zfsOverheadPct * 100).toFixed(0)}%</span>
            </label>
          </div>
        </Card>
      </div>

      {/* Right Column - Results */}
      <div className="space-y-4">
        {result && (
          <>
            <Card title="Storage Capacity">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Raw Storage:</span>
                  <span className="font-mono">{result.rawTb.toFixed(1)} TB</span>
                </div>
                <div className="flex justify-between">
                  <span>Usable (after parity):</span>
                  <span className="font-mono">{result.usableTb.toFixed(1)} TB</span>
                </div>
                <div className="flex justify-between">
                  <span>Usable (after ZFS):</span>
                  <span className="font-mono">{result.usableAfterZfsTb.toFixed(1)} TB</span>
                </div>
              </div>
            </Card>

            <Card title="Performance">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Read Speed:</span>
                  <span className="font-mono">{result.readGBs.toFixed(1)} GB/s</span>
                </div>
                <div className="flex justify-between">
                  <span>Write Speed:</span>
                  <span className="font-mono">{result.writeGBs.toFixed(1)} GB/s</span>
                </div>
                <div className="flex justify-between">
                  <span>ARC Boost:</span>
                  <span className="font-mono">{result.arcGBs.toFixed(1)} GB/s</span>
                </div>
              </div>
            </Card>

            <Card title="Drive Configuration">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Data Drives:</span>
                  <span className="font-mono">{result.dataDrives}</span>
                </div>
                <div className="flex justify-between">
                  <span>Parity Drives:</span>
                  <span className="font-mono">{result.parityDrives}</span>
                </div>
                <div className="pt-2 border-t">
                  <div className="text-xs text-gray-600">{result.protection}</div>
                </div>
              </div>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
