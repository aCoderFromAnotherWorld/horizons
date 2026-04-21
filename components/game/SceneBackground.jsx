"use client";

import SafeImage from "@/components/shared/SafeImage";
import { useState } from "react";

import { cn } from "@/lib/utils";

export default function SceneBackground({
  src,
  alt = "",
  fallbackClassName = "from-indigo-400 via-purple-400 to-pink-400",
  className,
  overlayClassName = "bg-black/20",
  children,
  priority = false,
}) {
  const [imageFailed, setImageFailed] = useState(!src);

  return (
    <div
      className={cn(
        "relative min-h-screen overflow-hidden bg-gradient-to-br",
        fallbackClassName,
        className,
      )}
    >
      {!imageFailed ? (
        <SafeImage
          src={src}
          alt={alt}
          fill
          priority={priority}
          sizes="100vw"
          className="object-cover"
          onError={() => setImageFailed(true)}
        />
      ) : null}
      <div className={cn("absolute inset-0", overlayClassName)} />
      <div className="relative z-10 min-h-screen">{children}</div>
    </div>
  );
}
