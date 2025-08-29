import React, { useEffect, useState } from "react";
import { Dropdown } from "../components/Dropdown";
import { Card } from "../components/Card";
import type { PerfInput, PerfResult } from "../../shared/modules/storagePerformance";

const nicOptions = [
  { label: "1 Gigabit", value: "1G" },
  { label: "10 Gigabit", value: "10G" },
  { label: "25 Gigabit", value: "25G" },
  { label: "40 Gigabit", value: "40G" },
  { label: "50 Gigabit", value: "50G" },
  { label: "100 Gigabit", value: "100G" }
];

export default function StoragePerformance() {
  const [input, setInput] = useState<PerfInput>({
    mbpsPerStream: 50,
    users: 10,
    readsPerUser: 2,
    writesPerUser: 1,
    nic: "10G"
  });

  const [result, setResult] = useState<PerfResult | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const out = await window.api.calc({ 
          module: "storagePerformance", 
          fn: "calcBandwidthNeeds", 
          payload: input 
        }) as PerfResult;
        setResult(out);
      } catch (error) {
        console.error("Calculation error:", error);
      }
    })();
  }, [input]);

  const updateInput = (key: keyof PerfInput, value: number | string) => {
    setInput(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left Column - Inputs */}
      <div className="space-y-4">
        <Card title="Bandwidth Requirements">
          <div className="space-y-3">
            <label className="flex items-center gap-2">
              <span className="w-40">Data Rate per Stream (Mbps)</span>
              <input
                type="number"
                className="border rounded p-2 w-24"
                value={input.mbpsPerStream}
                onChange={(e) => updateInput("mbpsPerStream", parseInt(e.target.value))}
                min="1"
              />
            </label>
            <label className="flex items-center gap-2">
              <span className="w-40">Simultaneous Users</span>
              <input
                type="number"
                className="border rounded p-2 w-24"
                value={input.users}
                onChange={(e) => updateInput("users", parseInt(e.target.value))}
                min="1"
              />
            </label>
            <label className="flex items-center gap-2">
              <span className="w-40">Reads per User</span>
              <input
                type="number"
                className="border rounded p-2 w-24"
                value={input.readsPerUser}
                onChange={(e) => updateInput("readsPerUser", parseInt(e.target.value))}
                min="0"
              />
            </label>
            <label className="flex items-center gap-2">
              <span className="w-40">Writes per User</span>
              <input
                type="number"
                className="border rounded p-2 w-24"
                value={input.writesPerUser}
                onChange={(e) => updateInput("writesPerUser", parseInt(e.target.value))}
                min="0"
              />
            </label>
            <Dropdown 
              label="Network Interface" 
              value={input.nic} 
              options={nicOptions} 
              onChange={(v) => updateInput("nic", v)} 
            />
          </div>
        </Card>
      </div>

      {/* Right Column - Results */}
      <div className="space-y-4">
        {result && (
          <>
            <Card title="Bandwidth Summary">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Total Bandwidth:</span>
                  <span className="font-mono">{result.totalMbps.toFixed(0)} Mbps</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Bandwidth:</span>
                  <span className="font-mono">{result.totalGbps.toFixed(2)} Gbps</span>
                </div>
                <div className="flex justify-between">
                  <span>Available Link:</span>
                  <span className="font-mono">{result.linkGbps.toFixed(2)} Gbps</span>
                </div>
              </div>
            </Card>

            <Card title="Link Utilization">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span>Utilization:</span>
                  <span className="font-mono">{result.utilPct.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div 
                    className={`h-4 rounded-full transition-all ${
                      result.utilPct > 90 ? 'bg-red-500' : 
                      result.utilPct > 75 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(100, result.utilPct)}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-600">
                  {result.utilPct > 90 ? 'Critical - Consider upgrading link' :
                   result.utilPct > 75 ? 'High - Monitor closely' :
                   'Good - Within safe limits'}
                </div>
              </div>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
