import React, { useEffect, useState } from "react";
import { Card } from "../components/Card";
import type { StreamsTable } from "../../shared/modules/streamCalc";

export default function StreamCalculator() {
  const [mbpsPerStream, setMbpsPerStream] = useState(50);
  const [streamsTable, setStreamsTable] = useState<StreamsTable>([]);
  const [gbPerHour, setGbPerHour] = useState(0);
  const [timeOnOneTB, setTimeOnOneTB] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        const streams = await window.api.calc({ 
          module: "streamCalc", 
          fn: "streamsForAllLinks", 
          payload: mbpsPerStream 
        }) as StreamsTable;
        setStreamsTable(streams);

        const gbhr = await window.api.calc({ 
          module: "streamCalc", 
          fn: "gbPerHour", 
          payload: mbpsPerStream 
        }) as number;
        setGbPerHour(gbhr);

        const timeTB = await window.api.calc({ 
          module: "streamCalc", 
          fn: "timeOnOneTBHours", 
          payload: mbpsPerStream 
        }) as number;
        setTimeOnOneTB(timeTB);
      } catch (error) {
        console.error("Calculation error:", error);
      }
    })();
  }, [mbpsPerStream]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left Column - Inputs */}
      <div className="space-y-4">
        <Card title="Stream Configuration">
          <div className="space-y-3">
            <label className="flex items-center gap-2">
              <span className="w-40">Data Rate per Stream (Mbps)</span>
              <input
                type="number"
                className="border rounded p-2 w-24"
                value={mbpsPerStream}
                onChange={(e) => setMbpsPerStream(parseInt(e.target.value))}
                min="1"
              />
            </label>
            <div className="text-sm text-gray-600">
              This will calculate how many streams each network link can support.
            </div>
          </div>
        </Card>
      </div>

      {/* Right Column - Results */}
      <div className="space-y-4">
        <Card title="Streams per Network Link">
          <div className="space-y-2">
            {streamsTable.map((row) => (
              <div key={row.nic} className="flex justify-between items-center py-2 border-b last:border-b-0">
                <span className="font-medium">{row.nic}</span>
                <span className="font-mono text-lg">{row.streams.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Storage Impact">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Data per Hour:</span>
              <span className="font-mono">{gbPerHour.toFixed(1)} GB</span>
            </div>
            <div className="flex justify-between">
              <span>Time on 1 TB:</span>
              <span className="font-mono">{timeOnOneTB.toFixed(1)} hours</span>
            </div>
            <div className="text-xs text-gray-600">
              Based on continuous streaming at {mbpsPerStream} Mbps
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
