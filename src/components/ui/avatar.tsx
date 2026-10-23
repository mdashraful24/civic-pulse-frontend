"use client";

import Image from "next/image";
import { useState } from "react";
import { cn, initials } from "@/lib/format";

const sizeClasses = {
  xs: "h-7 w-7 text-[10px]",
  sm: "h-9 w-9 text-xs",
  md: "h-11 w-11 text-sm",
  lg: "h-16 w-16 text-lg",
  xl: "h-24 w-24 text-2xl",
};

const pixelSizes = {
  xs: 28,
  sm: 36,
  md: 44,
  lg: 64,
  xl: 96,
};

export function Avatar({
  name,
  src,
  size = "md",
  className,
}: {
  name: string;
  src?: string | null;
  size?: keyof typeof sizeClasses;
  className?: string;
}) {
  const [prevSrc, setPrevSrc] = useState(src);
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  if (prevSrc !== src) {
    setPrevSrc(src);
    setFailedSrc(null);
  }

  const showImage = Boolean(src) && failedSrc !== src;

  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-soft font-bold uppercase tracking-wide text-brand ring-1 ring-inset ring-brand/10",
        sizeClasses[size],
        className,
      )}
    >
      {showImage ? (
        <Image
          src={src as string}
          alt={name}
          width={pixelSizes[size]}
          height={pixelSizes[size]}
          className="h-full w-full object-cover"
          unoptimized
          onError={() => setFailedSrc(src ?? null)}
        />
      ) : (
        initials(name)
      )}
    </span>
  );
}
