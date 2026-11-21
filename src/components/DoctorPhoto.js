"use client";

import Image from "next/image";
import { useState } from "react";

export default function DoctorPhoto({
  src,
  name = "ডাক্তার",
  size = 96,
}) {
  const [failedUrl, setFailedUrl] = useState("");

  if (!src || failedUrl === src) {
    return (
      <div
        role="img"
        aria-label={`${name} — ছবি নেই`}
        style={{ width: size, height: size }}
        className="flex shrink-0 items-center justify-center rounded-2xl bg-[#e2eddd] text-sm text-[#526a48]"
      >
        ছবি নেই
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={`${name}-এর ছবি`}
      width={size}
      height={size}
      unoptimized
      onError={() => setFailedUrl(src)}
      style={{ width: size, height: size }}
      className="shrink-0 rounded-2xl object-cover"
    />
  );
}