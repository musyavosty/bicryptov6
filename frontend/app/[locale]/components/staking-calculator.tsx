"use client";

import React, { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { TrendingUp, Calculator, Coins, ArrowRight, Clock, Flame } from "lucide-react";
import { Link } from "@/i18n/routing";

const POOLS = [
  { label: "USDT Flexible", apr: 25, color: "from-green-500 to-emerald-500", lock: "No lock", vip: false },
  { label: "ETH 30-Day", apr: 22, color: "from-blue-500 to-cyan-500", lock: "30 days", vip: false },
  { label: "USDT Stable", apr: 35, color: "from-teal-500 to-green-500", lock: "60 days", vip: false },
  { label: "SOL High-Yield", apr: 45, color: "from-purple-500 to-violet-500", lock: "60 days", vip: false },
  { label: "USDT High-Yield", apr: 60, color: "from-orange-500 to-amber-500", lock: "90 days", vip: false },
  { label: "DM VIP Premium", apr: 120, color: "from-amber-500 to-yellow-400", lock: "90 days", vip: true },
];

function fmt(n: number) {
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Countdown: VIP pool closes in N days from a fixed future date
const VIP_CLOSE_DATE = (() => {
  const d = new Date();
  d.setDate(d.getDate() + 6);
  d.setHours(23, 59, 59, 0);
  return d;
})();

function useCountdown(target: Date) {
  const calc = () => {
    const diff = Math.max(0, target.getTime() - Date.now());
    const days = Math.floor(diff / 86400000);
    const hrs  = Math.floor((diff % 86400000) / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    const secs = Math.floor((diff % 60000) / 1000);
    return { days, hrs, mins, secs, done: diff === 0 };
  };
  const [state, setState] = useState(calc);
  useEffect(() => {
    const id = setInterval(() => setState(calc()), 1000);
    return () => clearInterval(id);
  }, []);
  return state;
}

function pad(n: number) { return String(n).padStart(2, "0"); }

export function StakingCalculator() {
  const [amount, setAmount] = useState(1000);
  const [selectedPool, setSelectedPool] = useState(5);
  const pool = POOLS[selectedPool];
  const cd = useCountdown(VIP_CLOSE_DATE);

  const daily   = useMemo(() => (amount * pool.apr) / 100 / 365, [amount, pool.apr]);
  const monthly = useMemo(() => daily * 30, [daily]);
  const annual  = useMemo(() => (amount * pool.apr) / 100, [amount, pool.apr]);
  const total   = useMemo(() => amount + annual, [amount, annual]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
      viewport={{ once: true }}
      className="mt-16 relative"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-emerald-500/5 to-transparent rounded-3xl blur-2xl" />
      <div className="relative rounded-3xl border border-white/10 bg-white/5 backdrop-blur-sm p-8 md:p-10">

        {/* VIP Countdown Banner */}
        {pool.vip && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 px-5 py-4 rounded-2xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30"
          >
            <div className="flex items-center gap-2 text-amber-400 font-semibold">
              <Flame className="w-5 h-5" />
              <span>VIP Pool — Limited spots remaining!</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <span className="text-sm text-amber-300 font-medium">Closes in:</span>
              <div className="flex items-center gap-1 font-mono font-bold text-white">
                {cd.days > 0 && <span className="px-2 py-1 rounded-lg bg-amber-500/30 text-amber-300">{cd.days}d</span>}
                <span className="px-2 py-1 rounded-lg bg-amber-500/30 text-amber-300">{pad(cd.hrs)}h</span>
                <span className="px-2 py-1 rounded-lg bg-amber-500/30 text-amber-300">{pad(cd.mins)}m</span>
                <span className="px-2 py-1 rounded-lg bg-amber-500/30 text-amber-300">{pad(cd.secs)}s</span>
              </div>
            </div>
          </motion.div>
        )}

        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
            <Calculator className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold">Staking Calculator</h3>
            <p className="text-sm text-muted-foreground">See exactly what you'd earn</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Inputs */}
          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="text-sm font-medium text-muted-foreground">Investment Amount</label>
                <div className="text-2xl font-bold text-foreground">${amount.toLocaleString()}</div>
              </div>
              <input
                type="range" min={100} max={50000} step={100} value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer
                  [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5
                  [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-amber-400
                  [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:cursor-pointer"
                style={{
                  background: `linear-gradient(to right, rgb(245,158,11) 0%, rgb(245,158,11) ${((amount - 100) / (50000 - 100)) * 100}%, rgba(255,255,255,0.1) ${((amount - 100) / (50000 - 100)) * 100}%, rgba(255,255,255,0.1) 100%)`
                }}
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>$100</span><span>$50,000</span>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground mb-3 block">Select Pool</label>
              <div className="grid grid-cols-2 gap-2">
                {POOLS.map((p, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedPool(i)}
                    className={`
                      relative px-3 py-2.5 rounded-xl text-left transition-all text-sm
                      ${selectedPool === i
                        ? `bg-gradient-to-r ${p.color} text-white shadow-lg`
                        : 'bg-white/5 hover:bg-white/10 text-muted-foreground border border-white/10'
                      }
                    `}
                  >
                    {p.vip && (
                      <span className="absolute -top-1.5 -right-1.5 px-1.5 py-0.5 rounded-full bg-amber-500 text-white text-[9px] font-bold leading-none">
                        VIP
                      </span>
                    )}
                    <div className="font-semibold">{p.label}</div>
                    <div className={`text-xs ${selectedPool === i ? 'text-white/80' : 'text-muted-foreground'}`}>
                      {p.apr}% APR · {p.lock}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Results */}
          <div className="flex flex-col justify-between">
            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
                <div className="text-sm text-muted-foreground mb-1">Daily Earnings</div>
                <div className="text-3xl font-bold text-foreground">${fmt(daily)}</div>
                <div className="text-xs text-muted-foreground mt-1">Every single day, automatically</div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                  <div className="text-xs text-muted-foreground mb-1">Monthly</div>
                  <div className="text-xl font-bold text-emerald-400">${fmt(monthly)}</div>
                </div>
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                  <div className="text-xs text-muted-foreground mb-1">Annual Profit</div>
                  <div className="text-xl font-bold text-amber-400">${fmt(annual)}</div>
                </div>
              </div>

              <div className={`p-5 rounded-2xl bg-gradient-to-r ${pool.color} relative overflow-hidden`}>
                <div className="absolute inset-0 opacity-20 bg-white/10" />
                <div className="relative">
                  <div className="flex items-center gap-2 mb-1">
                    <Coins className="w-4 h-4 text-white" />
                    <span className="text-sm text-white/80 font-medium">Total After 1 Year</span>
                  </div>
                  <div className="text-4xl font-bold text-white">${fmt(total)}</div>
                  <div className="text-sm text-white/70 mt-1">
                    ${fmt(amount)} principal + ${fmt(annual)} profit at {pool.apr}% APR
                  </div>
                </div>
              </div>
            </div>

            <Link href="/staking" className="block mt-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full h-14 rounded-2xl font-bold text-white bg-gradient-to-r ${pool.color} flex items-center justify-center gap-3 shadow-lg`}
              >
                <TrendingUp className="w-5 h-5" />
                Start Earning Now
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
