import React, { useEffect, useState } from "react";
import Shell from "./components/Shell";
import { Dropdown } from "./components/Dropdown";
import { Card } from "./components/Card";
import type { BitrateResult } from "../shared/modules/bitrate/bitrate.types";

type Option = { label: string; value: string };

const codecOptions: Option[] = [
  { label: "ProRes 422 HQ", value: "prores_422_hq" },
  { label: "DNxHR HQX", value: "dnxhr_hqx" }
];

const resolutionOptions: Option[] = [
  { label: "1920x1080 @ 29.97", value: "1080p29.97" },
  { label: "3840x2160 @ 23.976", value: "2160p23.976" }
];

export default function App() {
  const [codec, setCodec] = useState<string>();
  const [res, setRes] = useState<string>();
  const [estimate, setEstimate] = useState<string>("—");

  useEffect(() => {
    (async () => {
      if (!codec || !res) return setEstimate("—");
      const result = await window.api.calc({
        module: "bitrate",
        fn: "estimateBitrate",
        payload: { codec, resolutionKey: res, minutes: 10 }
      }) as BitrateResult;
      setEstimate(`${result.mbps.toFixed(2)} Mbps (~${result.gb.toFixed(2)} GB / 10 min)`);
    })();
  }, [codec, res]);

  return (
    <Shell>
      <div className="grid gap-4 max-w-2xl">
        <Card title="Quick Estimate">
          <div className="flex flex-col gap-3">
            <Dropdown label="Codec" value={codec} options={codecOptions} onChange={setCodec} />
            <Dropdown label="Resolution" value={res} options={resolutionOptions} onChange={setRes} />
            <div className="text-sm opacity-80">Estimate: {estimate}</div>
          </div>
        </Card>
      </div>
    </Shell>
  );
}
