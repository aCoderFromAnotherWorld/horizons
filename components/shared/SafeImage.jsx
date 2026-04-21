"use client";

import Image from "next/image";
import { useState } from "react";

import { cn } from "@/lib/utils";

export default function SafeImage({
  src,
  alt = "",
  className,
  fallbackClassName,
  fallbackLabel,
  fill,
  onError,
  ...props
}) {
  const [failed, setFailed] = useState(!src);

  if (failed) {
    return (
      <div
        className={cn(
          "grid place-items-center bg-white/70 text-center text-sm font-bold text-zinc-700",
          fill ? "absolute inset-0" : "",
          className,
          fallbackClassName,
        )}
        role={alt ? "img" : undefined}
        aria-label={alt || undefined}
      >
        <span aria-hidden="true">☁</span>
        <span className="sr-only">
          {fallbackLabel || alt || "Image unavailable"}
        </span>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      className={className}
      onError={(event) => {
        setFailed(true);
        onError?.(event);
      }}
      {...props}
    />
  );
}
