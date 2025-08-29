import React, { PropsWithChildren, useState } from "react";

const tabs = [
  { id: "home", label: "Home" },
  { id: "calculators", label: "Calculators" },
  { id: "luts", label: "LUT Explorer" },
  { id: "about", label: "About" }
];

export default function Shell({ children }: PropsWithChildren) {
  const [active, setActive] = useState("home");
  return (
    <div className="min-h-screen">
      <header className="p-4 border-b">
        <nav className="flex gap-4">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setActive(t.id)}
              className={`px-3 py-1 rounded ${active===t.id ? "bg-zinc-200 dark:bg-zinc-800" : ""}`}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </header>
      <main className="p-6">
        {active === "home" && <div>{children}</div>}
        {active === "calculators" && <div id="route-calcs"></div>}
        {active === "luts" && <div id="route-luts"></div>}
        {active === "about" && <div id="route-about"></div>}
      </main>
    </div>
  );
}
