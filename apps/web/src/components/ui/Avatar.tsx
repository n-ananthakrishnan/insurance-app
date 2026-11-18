"use client";

import * as React from "react";

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string | null;
  alt?: string;
}

interface AvatarFallbackProps extends React.HTMLAttributes<HTMLDivElement> {}

interface AvatarImageProps extends React.HTMLAttributes<HTMLImageElement> {
  src?: string | null;
  alt?: string;
}

export function Avatar({ src, alt, className, ...props }: AvatarProps) {
  return (
    <div
      className={`relative inline-flex items-center justify-center overflow-hidden rounded-full bg-navy-100 text-navy-800 ${className ?? ""}`}
      {...props}
    />
  );
}

export function AvatarImage({ src, alt, className, ...props }: AvatarImageProps) {
  if (!src) return null;
  return (
    <img
      src={src}
      alt={alt ?? ""}
      className={`aspect-square h-full w-full object-cover ${className ?? ""}`}
      {...props}
    />
  );
}

export function AvatarFallback({ className, ...props }: AvatarFallbackProps) {
  return (
    <div
      className={`flex h-full w-full items-center justify-center rounded-full bg-navy-100 text-navy-800 font-medium text-sm ${className ?? ""}`}
      {...props}
    />
  );
}
