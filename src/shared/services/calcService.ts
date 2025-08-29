export function clamp(n: number, min: number, max: number) { return Math.min(max, Math.max(min, n)); }
export function round(n: number, dp=2) { const f = 10**dp; return Math.round(n*f)/f; }
