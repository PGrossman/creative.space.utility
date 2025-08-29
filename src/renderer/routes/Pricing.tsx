import React, { useEffect, useState } from "react";
import { Card } from "../components/Card";
import type { PricingInput, PricingResult } from "../../shared/modules/pricing";

export default function Pricing() {
  const [input, setInput] = useState<PricingInput>({
    totalTb: 100,
    pricePerTbPerMonth: 0.15,
    surchargeMonthlyFactor: 1.15
  });

  const [result, setResult] = useState<PricingResult | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const out = await window.api.calc({ 
          module: "pricing", 
          fn: "pricingForTerms", 
          payload: input 
        }) as PricingResult;
        setResult(out);
      } catch (error) {
        console.error("Calculation error:", error);
      }
    })();
  }, [input]);

  const updateInput = (key: keyof PricingInput, value: number) => {
    setInput(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left Column - Inputs */}
      <div className="space-y-4">
        <Card title="Pricing Configuration">
          <div className="space-y-3">
            <label className="flex items-center gap-2">
              <span className="w-40">Total Storage (TB)</span>
              <input
                type="number"
                className="border rounded p-2 w-24"
                value={input.totalTb}
                onChange={(e) => updateInput("totalTb", parseFloat(e.target.value))}
                min="0.1"
                step="0.1"
              />
            </label>
            <label className="flex items-center gap-2">
              <span className="w-40">Price per TB/Month ($)</span>
              <input
                type="number"
                className="border rounded p-2 w-24"
                value={input.pricePerTbPerMonth}
                onChange={(e) => updateInput("pricePerTbPerMonth", parseFloat(e.target.value))}
                min="0.01"
                step="0.01"
              />
            </label>
            <label className="flex items-center gap-2">
              <span className="w-40">Monthly Surcharge Factor</span>
              <input
                type="number"
                className="border rounded p-2 w-24"
                value={input.surchargeMonthlyFactor}
                onChange={(e) => updateInput("surchargeMonthlyFactor", parseFloat(e.target.value))}
                min="1.0"
                step="0.01"
              />
            </label>
            <div className="text-sm text-gray-600">
              Monthly surcharge applies when not committing to annual terms.
            </div>
          </div>
        </Card>
      </div>

      {/* Right Column - Results */}
      <div className="space-y-4">
        {result && (
          <>
            <Card title="Calculation">
              <div className="text-sm text-gray-600 mb-3">
                {result.calcText}
              </div>
            </Card>

            <Card title="Pricing by Contract Term">
              <div className="space-y-2">
                {result.rows.map((row) => (
                  <div key={row.termYears} className="flex justify-between items-center py-2 border-b last:border-b-0">
                    <span className="font-medium">{row.termYears} Year{row.termYears > 1 ? 's' : ''}</span>
                    <div className="text-right">
                      <div className="font-mono">${row.perMonthAnnual.toFixed(2)}/mo (annual)</div>
                      <div className="font-mono text-sm text-gray-600">${row.perMonthMonthly.toFixed(2)}/mo (monthly)</div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card title="Total Costs">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Annual (1 year):</span>
                  <span className="font-mono">${(result.rows[0].perMonthAnnual * 12).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Annual (3 years):</span>
                  <span className="font-mono">${(result.rows[2].perMonthAnnual * 36).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Annual (5 years):</span>
                  <span className="font-mono">${(result.rows[3].perMonthAnnual * 60).toFixed(2)}</span>
                </div>
              </div>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
