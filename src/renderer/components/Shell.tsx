import React, { PropsWithChildren, useState } from "react";
import StorageSize from "../routes/StorageSize";
import StoragePerformance from "../routes/StoragePerformance";
import StreamCalculator from "../routes/StreamCalculator";
import Pricing from "../routes/Pricing";

const tabs = [
  { id: "storage-size", label: "Storage Size" },
  { id: "storage-performance", label: "Storage Performance" },
  { id: "stream-calculator", label: "Stream Calculator" },
  { id: "pricing", label: "Pricing" }
];

export default function Shell({ children }: PropsWithChildren) {
  const [active, setActive] = useState("storage-size");
  
  return (
    <div className="min-h-screen">
      <header className="p-4 border-b bg-white dark:bg-zinc-900">
        <h1 className="text-xl font-semibold mb-2">Storage Calculator</h1>
        <nav className="flex gap-4">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setActive(t.id)}
              className={`px-3 py-1 rounded transition-colors ${
                active === t.id 
                  ? "bg-blue-500 text-white" 
                  : "bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700"
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </header>
      <main className="p-6 bg-gray-50 dark:bg-zinc-950 min-h-screen">
        {active === "storage-size" && <StorageSize />}
        {active === "storage-performance" && <StoragePerformance />}
        {active === "stream-calculator" && <StreamCalculator />}
        {active === "pricing" && <Pricing />}
      </main>
    </div>
  );
}
