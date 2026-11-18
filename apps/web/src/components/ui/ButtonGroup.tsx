"use client";

import * as React from "react";

interface ButtonGroupProps extends React.HTMLAttributes<HTMLDivElement> {}

export function ButtonGroup({ className, ...props }: ButtonGroupProps) {
  return (
    <div
      className={`inline-flex flex-col gap-2 ${className ?? ""}`}
      {...props}
    />
  );
}
