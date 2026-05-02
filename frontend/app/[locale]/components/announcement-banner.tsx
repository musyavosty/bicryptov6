"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Flame, ArrowRight } from "lucide-react";
import { Link } from "@/i18n/routing";

const STORAGE_KEY = "dm_banner_dismissed_v1";

function useCountdown(daysAhead: number) {
  const target = React.useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + daysAhead);
    d.setHours(23, 59, 59, 0);
    return d;
  }, []);

  const calc = () => {
    const diff = Math.max(0, target.getTime() - Date.now());
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    const days = Math.floor(h / 24);
    return `${days}d ${String(h % 24).padStart(2, "0")}h ${String(m).padStart(2, "0")}m ${String(s).padStart(2, "0")}s`;
  };

  const [label, setLabel] = useState(calc);
  useEffect(() => {
    const id = setInterval(() => setLabel(calc()), 1000);
    return () => clearInterval(id);
  }, []);

  return label;
}

export function AnnouncementBanner() {
  const [visible, setVisible] = useState(false);
  const countdown = useCountdown(6);

  useEffect(() => {
    const dismissed = sessionStorage.getItem(STORAGE_KEY);
    if (!dismissed) setVisible(true);
  }, []);

  const dismiss = () => {
    sessionStorage.setItem(STORAGE_KEY, "1");
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="overflow-hidden"
        >
          <div className="relative bg-gradient-to-r from-amber-600 via-orange-500 to-amber-600 text-white">
            {/* Subtle shimmer */}
            <div className="absolute inset-0 overflow-hidden">
              <motion.div
                animate={{ x: ["-100%", "200%"] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear", repeatDelay: 2 }}
                className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12"
              />
            </div>

            <div className="relative container mx-auto px-4 py-2.5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 sm:gap-4 flex-wrap text-sm font-medium">
                <div className="flex items-center gap-1.5">
                  <Flame className="w-4 h-4 flex-shrink-0" />
                  <span className="font-bold">DM VIP Pool — 120% APR</span>
                </div>
                <span className="hidden sm:inline text-white/80">·</span>
                <span className="text-white/90">Limited spots. Closes in</span>
                <span className="font-mono font-bold bg-black/20 px-2 py-0.5 rounded-md text-xs">
                  {countdown}
                </span>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <Link href="/staking" onClick={dismiss}>
                  <motion.span
                    whileHover={{ scale: 1.05 }}
                    className="hidden sm:flex items-center gap-1 px-3 py-1 rounded-full bg-white/20 hover:bg-white/30 text-sm font-bold transition-colors cursor-pointer"
                  >
                    Stake Now <ArrowRight className="w-3.5 h-3.5" />
                  </motion.span>
                </Link>
                <button
                  onClick={dismiss}
                  className="w-6 h-6 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors flex-shrink-0"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
