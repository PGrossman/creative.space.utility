export {};
declare global {
  interface Window {
    api: {
      calc(req: { module: string; fn: string; payload: unknown }): Promise<any>;
    };
  }
}
