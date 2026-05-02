"use client";

import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { useLogoCacheStore } from "@/store/logo-cache";

interface LogoProps {
  type?: "icon" | "text";
  className?: string;
  width?: number;
  height?: number;
}

function DeMourinhoIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("w-full h-full", className)}
    >
      <defs>
        <linearGradient id="dm-bg" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#EA580C" />
        </linearGradient>
        <linearGradient id="dm-shine" x1="0" y1="0" x2="0" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="white" stopOpacity="0.3" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points="20,2 35.6,11 35.6,29 20,38 4.4,29 4.4,11" fill="url(#dm-bg)" />
      <polygon points="20,2 35.6,11 35.6,29 20,38 4.4,29 4.4,11" fill="url(#dm-shine)" />
      <text
        x="20"
        y="26"
        textAnchor="middle"
        fill="white"
        fontWeight="900"
        fontSize="14"
        fontFamily="system-ui,-apple-system,BlinkMacSystemFont,sans-serif"
        letterSpacing="-0.5"
      >
        DM
      </text>
    </svg>
  );
}

function DeMourinhoTextLogo({ isDark, className }: { isDark: boolean; className?: string }) {
  const textColor = isDark ? "#FDE68A" : "#D97706";
  const subColor = isDark ? "#FDE68A" : "#D97706";
  const gradStart = isDark ? "#FBBF24" : "#F59E0B";
  const gradEnd = isDark ? "#F97316" : "#EA580C";
  const textGradStart = isDark ? "#FDE68A" : "#D97706";
  const textGradEnd = isDark ? "#FDBA74" : "#EA580C";

  return (
    <svg
      viewBox="0 0 220 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("w-full h-full", className)}
    >
      <defs>
        <linearGradient id="dm-icon-bg" x1="0" y1="0" x2="34" y2="34" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={gradStart} />
          <stop offset="100%" stopColor={gradEnd} />
        </linearGradient>
        <linearGradient id="dm-text-g" x1="44" y1="0" x2="220" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={textGradStart} />
          <stop offset="100%" stopColor={textGradEnd} />
        </linearGradient>
      </defs>
      <polygon points="18,1 33,9.5 33,26.5 18,35 3,26.5 3,9.5" fill="url(#dm-icon-bg)" />
      <text
        x="18"
        y="23"
        textAnchor="middle"
        fill="white"
        fontWeight="900"
        fontSize="12"
        fontFamily="system-ui,-apple-system,sans-serif"
        letterSpacing="-0.5"
      >
        DM
      </text>
      <text
        x="43"
        y="23"
        fill="url(#dm-text-g)"
        fontWeight="800"
        fontSize="17"
        fontFamily="system-ui,-apple-system,sans-serif"
      >
        DeMourinho
      </text>
      <text
        x="43"
        y="33"
        fill={subColor}
        fontWeight="600"
        fontSize="9"
        fontFamily="system-ui,-apple-system,sans-serif"
        opacity="0.75"
        letterSpacing="2"
      >
        CRYPTO
      </text>
    </svg>
  );
}

export default function Logo({
  type = "icon",
  className,
}: LogoProps) {
  const { resolvedTheme } = useTheme();
  const { logoVersion } = useLogoCacheStore();
  const [mounted, setMounted] = useState(false);
  const [useCustomImage, setUseCustomImage] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Check if admin has uploaded a custom logo
  useEffect(() => {
    if (!mounted) return;
    const checkCustomLogo = async () => {
      try {
        const url = type === "icon" ? "/img/logo/logo.webp" : "/img/logo/logo-text.webp";
        const res = await fetch(`${url}?v=${logoVersion}`, { method: "HEAD" });
        if (res.ok) setUseCustomImage(true);
      } catch {
        setUseCustomImage(false);
      }
    };
    checkCustomLogo();
  }, [mounted, logoVersion, type]);

  const isDark = mounted ? resolvedTheme === "dark" : false;

  // If admin has uploaded a custom webp logo, use that
  if (mounted && useCustomImage && !imageError) {
    const cacheBuster = `?v=${logoVersion}`;
    const url = type === "icon"
      ? (isDark ? `/img/logo/logo-dark.webp${cacheBuster}` : `/img/logo/logo.webp${cacheBuster}`)
      : (isDark ? `/img/logo/logo-text-dark.webp${cacheBuster}` : `/img/logo/logo-text.webp${cacheBuster}`);

    const containerClass = type === "icon"
      ? "relative h-9 w-9 lg:h-10 lg:w-10 flex-shrink-0"
      : "relative h-9 lg:h-12 w-[180px] lg:w-[220px] flex-shrink-0";

    return (
      <div className={cn(containerClass, className)}>
        <img
          src={url}
          alt="Logo"
          className="object-contain w-full h-full"
          decoding="async"
          onError={() => setImageError(true)}
        />
      </div>
    );
  }

  // Default: render inline SVG DeMourinho Crypto logo
  if (type === "icon") {
    return (
      <div className={cn("relative h-9 w-9 lg:h-10 lg:w-10 flex-shrink-0", className)}>
        <DeMourinhoIcon />
      </div>
    );
  }

  return (
    <div className={cn("relative h-9 lg:h-12 w-[180px] lg:w-[220px] flex-shrink-0", className)}>
      <DeMourinhoTextLogo isDark={isDark} />
    </div>
  );
}
