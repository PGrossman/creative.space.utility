import { z } from "zod";

export const CalcRequest = z.object({
  module: z.enum(["storageCapacity", "storagePerformance", "streamCalc", "pricing"]),
  fn: z.string(),
  payload: z.unknown()
});
export type CalcRequest = z.infer<typeof CalcRequest>;
