import { z } from "zod";

export const CalcRequest = z.object({
  module: z.string(), // e.g., "bitrate"
  fn: z.string(),     // e.g., "estimateBitrate"
  payload: z.unknown()
});
export type CalcRequest = z.infer<typeof CalcRequest>;
