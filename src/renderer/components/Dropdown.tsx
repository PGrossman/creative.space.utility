import React from "react";

export function Dropdown<T extends string | number>({
  label, value, options, onChange
}: {
  label: string;
  value: T | undefined;
  options: { label: string; value: T }[];
  onChange: (v: T) => void;
}) {
  return (
    <label className="flex items-center gap-2">
      <span className="w-40">{label}</span>
      <select
        className="border rounded p-2"
        value={value ?? ""}
        onChange={e => onChange((e.target.value as any) as T)}
      >
        <option value="" disabled>Select…</option>
        {options.map(o => <option key={String(o.value)} value={String(o.value)}>{o.label}</option>)}
      </select>
    </label>
  );
}
