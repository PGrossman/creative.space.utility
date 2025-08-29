export type PricingInput = { 
  totalTb: number; 
  pricePerTbPerMonth: number; 
  surchargeMonthlyFactor?: number; 
};

export type PricingRow = { 
  termYears: number; 
  perMonthAnnual: number; 
  perMonthMonthly: number; 
};

export type PricingResult = { 
  totalTb: number; 
  rows: PricingRow[]; 
  calcText: string; 
};

export function pricingForTerms(i: PricingInput): PricingResult {
  const monthly = i.totalTb * i.pricePerTbPerMonth;
  const monthlySurch = monthly * (i.surchargeMonthlyFactor ?? 1.15);
  const terms = [1,2,3,5];
  const rows = terms.map(termYears => ({
    termYears,
    perMonthAnnual: Number(monthly.toFixed(2)),
    perMonthMonthly: Number(monthlySurch.toFixed(2)),
  }));
  const calcText = `${i.totalTb.toFixed(1)} TB × $${i.pricePerTbPerMonth.toFixed(2)}/TB`;
  return { totalTb: i.totalTb, rows, calcText };
}
