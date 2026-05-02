"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Rocket, ArrowRight, Users, TrendingUp, Clock } from "lucide-react";
import { Link } from "@/i18n/routing";

const PRESALE_TOTAL = 5_000_000;

function useRaisedProgress() {
  const [raised, setRaised] = useState(3_147_500);
  useEffect(() => {
    const id = setInterval(() => {
      setRaised((prev) => {
        const delta = Math.random() * 250 + 50;
        return Math.min(prev + delta, PRESALE_TOTAL * 0.92);
      });
    }, 8000);
    return () => clearInterval(id);
  }, []);
  return raised;
}

function useCountdown() {
  const target = useRef(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    d.setHours(23, 59, 59, 0);
    return d;
  });
  const calc = () => {
    const diff = Math.max(0, target.current().getTime() - Date.now());
    const days = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    return { days, h, m, s };
  };
  const [cd, setCd] = useState(calc);
  useEffect(() => {
    const id = setInterval(() => setCd(calc()), 1000);
    return () => clearInterval(id);
  }, []);
  return cd;
}

function TimeBox({ val, label }: { val: number; label: string }) {
  return (
    <div className="text-center">
      <div className="text-2xl md:text-3xl font-black font-mono bg-black/30 rounded-xl px-3 py-2 min-w-[60px] tabular-nums">
        {String(val).padStart(2, "0")}
      </div>
      <div className="text-[10px] mt-1 font-semibold text-white/70 uppercase tracking-wider">{label}</div>
    </div>
  );
}

export function TokenSaleBanner() {
  const raised = useRaisedProgress();
  const cd = useCountdown();
  const pct = Math.min(100, (raised / PRESALE_TOTAL) * 100);

  return (
    <section className="relative py-20 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-violet-950/30 via-purple-900/20 to-amber-950/20" />
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="rounded-3xl overflow-hidden bg-gradient-to-br from-violet-900/50 via-purple-800/40 to-amber-900/30 border border-violet-500/30"
        >
          <div className="p-8 md:p-10 lg:p-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
              {/* Left */}
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/20 border border-violet-500/30 text-violet-300 text-xs font-bold mb-5">
                  <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
                  PRESALE LIVE — Phase 2 of 3
                </div>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-4 leading-tight">
                  DM Token
                  <span className="block text-xl md:text-2xl font-semibold text-white/70 mt-1">
                    Africa&apos;s DeFi Utility Token
                  </span>
                </h2>
                <p className="text-white/70 mb-6 leading-relaxed">
                  DM Token powers the DeMourinho ecosystem — fee discounts, governance voting, staking multipliers,
                  and exclusive VIP pool access. Get in early at <strong className="text-white">$0.028 / DMC</strong>.
                  Listed price: <strong className="text-amber-300">$0.15</strong>.
                </p>

                <div className="flex flex-wrap gap-4 text-sm mb-8">
                  {[
                    { icon: Users, label: "1,247 investors" },
                    { icon: TrendingUp, label: "5.3x listing upside" },
                    { icon: Clock, label: "Phase 2 ends in" },
                  ].map((item, i) => {
                    const Icon = item.icon;
                    return (
                      <div key={i} className="flex items-center gap-2 text-white/70">
                        <Icon className="w-4 h-4 text-violet-400" />
                        <span>{item.label}</span>
                      </div>
                    );
                  })}
                </div>

                <Link href="/ico">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="inline-flex items-center gap-3 h-14 px-8 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-bold text-base transition-all shadow-lg shadow-violet-900/30"
                  >
                    <Rocket className="w-5 h-5" />
                    Buy DMC Tokens <ArrowRight className="w-4 h-4" />
                  </motion.button>
                </Link>
              </div>

              {/* Right */}
              <div className="space-y-6">
                {/* Countdown */}
                <div className="rounded-2xl bg-black/20 border border-white/10 p-5">
                  <p className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-4">Phase 2 Ends In</p>
                  <div className="flex items-start gap-3 justify-center">
                    <TimeBox val={cd.days} label="Days" />
                    <span className="text-2xl font-bold text-white/50 mt-2">:</span>
                    <TimeBox val={cd.h} label="Hours" />
                    <span className="text-2xl font-bold text-white/50 mt-2">:</span>
                    <TimeBox val={cd.m} label="Mins" />
                    <span className="text-2xl font-bold text-white/50 mt-2">:</span>
                    <TimeBox val={cd.s} label="Secs" />
                  </div>
                </div>

                {/* Progress */}
                <div className="rounded-2xl bg-black/20 border border-white/10 p-5">
                  <div className="flex justify-between text-sm mb-3">
                    <span className="text-white/60">Raised</span>
                    <span className="font-bold text-white">
                      ${raised.toLocaleString("en-US", { maximumFractionDigits: 0 })} / $5,000,000
                    </span>
                  </div>
                  <div className="h-3 rounded-full bg-white/10 overflow-hidden mb-2">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-violet-500 to-amber-400"
                      style={{ width: `${pct}%` }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-white/50">
                    <span>{pct.toFixed(1)}% filled</span>
                    <span>Hard cap: $5M</span>
                  </div>
                </div>

                {/* Token details */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Presale Price", val: "$0.028 / DMC" },
                    { label: "Listing Price", val: "$0.150 / DMC" },
                    { label: "Total Supply", val: "1,000,000,000 DMC" },
                    { label: "Presale Allocation", val: "15% (150M DMC)" },
                  ].map((d, i) => (
                    <div key={i} className="rounded-xl bg-black/20 border border-white/10 p-3">
                      <div className="text-[10px] text-white/40 mb-1">{d.label}</div>
                      <div className="text-xs font-bold text-white">{d.val}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
