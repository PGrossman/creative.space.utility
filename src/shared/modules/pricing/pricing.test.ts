import { describe, it, expect } from "vitest";
import { pricingForTerms } from "./index";

describe("pricingForTerms", () => {
  it("calculates pricing for different terms correctly", () => {
    const input = {
      totalTb: 100,
      pricePerTbPerMonth: 0.15,
      surchargeMonthlyFactor: 1.15
    };

    const result = pricingForTerms(input);

    expect(result.totalTb).toBe(100);
    expect(result.calcText).toBe("100.0 TB × $0.15/TB");
    expect(result.rows).toHaveLength(4); // 1, 2, 3, 5 years

    // Check 1 year term
    const oneYear = result.rows[0];
    expect(oneYear.termYears).toBe(1);
    expect(oneYear.perMonthAnnual).toBe(15); // 100 * 0.15
    expect(oneYear.perMonthMonthly).toBe(17.25); // 15 * 1.15

    // Check 5 year term
    const fiveYear = result.rows[3];
    expect(fiveYear.termYears).toBe(5);
    expect(fiveYear.perMonthAnnual).toBe(15);
    expect(fiveYear.perMonthMonthly).toBe(17.25);
  });

  it("uses default surcharge factor when not provided", () => {
    const input = {
      totalTb: 50,
      pricePerTbPerMonth: 0.20
    };

    const result = pricingForTerms(input);

    expect(result.rows[0].perMonthAnnual).toBe(10); // 50 * 0.20
    expect(result.rows[0].perMonthMonthly).toBe(11.5); // 10 * 1.15 (default)
  });
});
