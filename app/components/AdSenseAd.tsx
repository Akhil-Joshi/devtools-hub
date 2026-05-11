"use client";

import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

type AdSenseAdProps = {
  className?: string;
  format?: "auto" | "fluid" | "horizontal" | "rectangle" | "vertical";
  label?: string;
  slot?: string;
};

export default function AdSenseAd({
  className = "",
  format = "auto",
  label,
  slot = "XXXXXXXXXX",
}: AdSenseAdProps) {
  const adRef = useRef<HTMLModElement | null>(null);
  const [isHidden, setIsHidden] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      window.adsbygoogle = window.adsbygoogle || [];
      window.adsbygoogle.push({});
    } catch (err) {
      console.warn("AdSense error:", err);
    }

    const timeout = window.setTimeout(() => {
      const ad = adRef.current;

      if (!ad) {
        setIsHidden(true);
        return;
      }

      const status = ad.getAttribute("data-ad-status");
      const hasVisibleSize = ad.offsetHeight > 0 && ad.offsetWidth > 0;

      if (status === "unfilled" || !hasVisibleSize) {
        setIsHidden(true);
      }
    }, 2500);

    return () => window.clearTimeout(timeout);
  }, []);

  if (isHidden) return null;

  return (
    <aside
      className={`my-8 w-full ${className}`}
      aria-label={label ? `Advertisement: ${label}` : "Advertisement"}
    >
      <div className="mb-2 text-center text-[11px] font-semibold uppercase tracking-wide text-gray-400">
        Advertisement
      </div>

      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: "block", minHeight: 90 }}
        data-ad-client="ca-pub-XXXXXXXXXXXX"
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </aside>
  );
}
