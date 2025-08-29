import React, { PropsWithChildren } from "react";
export function Card({ title, children }: PropsWithChildren<{ title: string }>) {
  return (
    <div className="border rounded-xl p-4 shadow-sm">
      <h3 className="font-semibold mb-2">{title}</h3>
      {children}
    </div>
  );
}
