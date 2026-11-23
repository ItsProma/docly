"use client";

import Image from "next/image";
import { useState } from "react";

export default function DoctorPhoto({ src, name, size = 96 }) {
  const [failedUrl, setFailedUrl] = useState(null);
  const showPhoto = Boolean(src) && failedUrl !== src;

  if (!showPhoto) {
    return (
      <div
        role="img"
        aria-label="ডাক্তারের ডিফল্ট অ্যাভাটার"
        className="flex shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-[#edf5f1]"
        style={{ width: size, height: size }}
      >
        <svg
          viewBox="0 0 100 100"
          width="85%"
          height="85%"
          fill="none"
          aria-hidden="true"
        >
          <circle cx="50" cy="32" r="16" fill="#83aaa0" />
          <path
            d="M18 91V78c0-18 14-29 32-29s32 11 32 29v13"
            fill="#fff"
          />
          <path d="m41 51 9 18 9-18" fill="#c5ddd4" />
          <path
            d="M36 55v15a14 14 0 0 0 28 0V55"
            stroke="#267764"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <circle
            cx="64"
            cy="73"
            r="6"
            fill="#edf5f1"
            stroke="#267764"
            strokeWidth="3"
          />
        </svg>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={name ? `${name}-এর ছবি` : "ডাক্তারের ছবি"}
      width={size}
      height={size}
      unoptimized
      onError={() => setFailedUrl(src)}
      className="shrink-0 rounded-2xl object-cover"
      style={{ width: size, height: size }}
    />
  );
}