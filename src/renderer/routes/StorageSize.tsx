import React, { useEffect, useMemo, useState } from "react";

type RaidType = "RAIDZ1" | "RAIDZ2" | "RAIDZ3";
type InputState = {
  raidType: RaidType;
  drivesPerVdev: number;
  vdevs: number;
  driveSizeTb: number;
  driveSpeedMBs: number;
  zfsOverheadPct: number; // 0..1
};

type Result = {
  rawTb: number;
  parityTb: number;
  zfsOverheadTb: number;
  usableTbBeforeZfs: number;
  usableTb: number;
  readGBs: number;
  arcGBs: number;
  writeGBs: number;
  totalDrives: number;
  dataDrives: number;
  parityDrives: number;
  protection: string;
};

const TB = (n: number) => `${n.toFixed(1)} TB`;
const GBS = (n: number) => `${n.toFixed(2)} GB/s`;

export default function StorageSize() {
  const [input, setInput] = useState<InputState>({
    raidType: "RAIDZ2",
    drivesPerVdev: 6,
    vdevs: 1,
    driveSizeTb: 16,
    driveSpeedMBs: 225,
    zfsOverheadPct: 0.20
  });

  const [out, setOut] = useState<Result | null>(null);
  const overheadPctDisplay = useMemo(() => Math.round(input.zfsOverheadPct * 100), [input.zfsOverheadPct]);

  useEffect(() => {
    (async () => {
      try {
        const res = await window.api.calc({
          module: "storageCapacity",
          fn: "calcCapacity",
          payload: input
        });
        
        // Successfully calculated storage values
        
        setOut(res as Result);
      } catch (e) {
        console.error(e);
        setOut(null);
      }
    })();
  }, [input]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left: inputs */}
      <div className="border rounded-xl p-5 bg-white/50">
        <h3 className="font-semibold mb-4">Drive Configuration</h3>

        <Field label="RAID Type:">
          <select
            className="border rounded p-2 w-full"
            value={input.raidType}
            onChange={(e) => setInput(s => ({ ...s, raidType: e.target.value as RaidType }))}
          >
            <option value="RAIDZ1">RAIDZ1</option>
            <option value="RAIDZ2">RAIDZ2</option>
            <option value="RAIDZ3">RAIDZ3</option>
          </select>
        </Field>

        <Field label="Drives per VDEV:">
          <NumberInput value={input.drivesPerVdev} min={2} step={1}
            onChange={(n) => setInput(s => ({ ...s, drivesPerVdev: n }))} />
        </Field>

        <Field label="Number of VDEVs:">
          <NumberInput value={input.vdevs} min={1} step={1}
            onChange={(n) => setInput(s => ({ ...s, vdevs: n }))} />
        </Field>

        <Field label="Drive Size (TB):">
          <select
            className="border rounded p-2 w-full"
            value={input.driveSizeTb}
            onChange={(e) => setInput(s => ({ ...s, driveSizeTb: Number(e.target.value) }))}
          >
            <option value={16}>16 TB</option>
            <option value={20}>20 TB</option>
            <option value={24}>24 TB</option>
          </select>
        </Field>

        <Field label="Drive Speed (MB/s):">
          <NumberInput value={input.driveSpeedMBs} min={1} step={1}
            onChange={(n) => setInput(s => ({ ...s, driveSpeedMBs: n }))} />
        </Field>

        <div className="mt-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">ZFS Overhead (%):</label>
            <span className="text-sm">{overheadPctDisplay}%</span>
          </div>
          <input
            type="range"
            className="w-full"
            min={0}
            max={40}
            step={1}
            value={overheadPctDisplay}
            onChange={(e) => setInput(s => ({ ...s, zfsOverheadPct: Number(e.target.value) / 100 }))}
          />
        </div>

        <div className="mt-6">
          <div className="text-xs uppercase tracking-wide text-zinc-500">Total Raw Storage:</div>
          <div className="mt-1 p-3 border rounded-lg text-center font-semibold">
            {out ? TB(out.rawTb) : "—"}
          </div>
        </div>
      </div>

      {/* Right: results */}
      <div className="grid gap-5">
        <Card title="Usable Storage">
          <StatRow name="Total Capacity:" value={out ? TB(out.rawTb) : "—"} />
          <StatRow name="ZFS Overhead:" value={out ? TB(out.zfsOverheadTb) : "—"} />
          <StatRow name="RAID:" value={out ? TB(out.parityTb) : "—"} />
          <div className="mt-3 text-2xl font-bold">{out ? TB(out.usableTb) : "—"}</div>
        </Card>

        <Card title="Read Performance">
          <StatRow name="Read Speed:" value={out ? GBS(out.readGBs) : "—"} emphasis="green" />
          <StatRow name="ARC Performance:" value={out ? GBS(out.arcGBs) : "—"} />
          <StatRow name="Write Speed:" value={out ? GBS(out.writeGBs) : "—"} emphasis="red" />
        </Card>

        <Card title="Drive Configuration">
          <div className="text-xl font-semibold mb-1">{out ? `${out.totalDrives} Drives` : "—"}</div>
          <StatRow name="Total Drives:" value={out ? String(out.totalDrives) : "—"} />
          <StatRow name="Data Drives:" value={out ? String(out.dataDrives) : "—"} />
          <StatRow name="Parity Drives:" value={out ? String(out.parityDrives) : "—"} />
        </Card>

        <Card title="Protection Level">
          <div className="text-lg font-semibold">{out ? out.protection : "—"}</div>
        </Card>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-2 mb-4">
      <span className="text-sm font-medium">{label}</span>
      {children}
    </label>
  );
}

function NumberInput({
  value, onChange, min = 0, step = 1
}: {
  value: number; onChange: (n: number) => void; min?: number; step?: number;
}) {
  return (
    <input
      type="number"
      className="border rounded p-2 w-full"
      value={value}
      min={min}
      step={step}
      onChange={(e) => onChange(Number(e.target.value))}
    />
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border rounded-xl p-5 bg-white/50">
      <h3 className="font-semibold mb-3">{title}</h3>
      {children}
    </div>
  );
}

function StatRow({
  name, value, emphasis
}: {
  name: string; value: string; emphasis?: "green" | "red";
}) {
  const cls = emphasis === "green" ? "text-green-600"
           : emphasis === "red"   ? "text-red-600"
           : "text-zinc-900";
  return (
    <div className="flex items-center justify-between text-sm py-1">
      <div className="text-zinc-600">{name}</div>
      <div className={`font-medium ${cls}`}>{value}</div>
    </div>
  );
}
