"use client";

import React, { useRef } from "react";
import { motion } from "framer-motion";
import { Shield, Users, Zap, TrendingUp, Lock, Star, Globe, Award } from "lucide-react";

const STATS = [
  { icon: Users, label: "Active Traders", value: "3,200+", color: "text-amber-400" },
  { icon: Shield, label: "Funds Secured", value: "$2.4M+", color: "text-emerald-400" },
  { icon: Zap, label: "Trading Fee", value: "0.08%", color: "text-blue-400" },
  { icon: TrendingUp, label: "Max Binary Payout", value: "95%", color: "text-purple-400" },
  { icon: Star, label: "Max Staking APR", value: "120%", color: "text-amber-400" },
  { icon: Globe, label: "Countries Served", value: "40+", color: "text-emerald-400" },
  { icon: Lock, label: "Uptime", value: "99.9%", color: "text-blue-400" },
  { icon: Award, label: "Withdrawal Success", value: "100%", color: "text-green-400" },
  { icon: Users, label: "Active Traders", value: "3,200+", color: "text-amber-400" },
  { icon: Shield, label: "Funds Secured", value: "$2.4M+", color: "text-emerald-400" },
  { icon: Zap, label: "Trading Fee", value: "0.08%", color: "text-blue-400" },
  { icon: TrendingUp, label: "Max Binary Payout", value: "95%", color: "text-purple-400" },
  { icon: Star, label: "Max Staking APR", value: "120%", color: "text-amber-400" },
  { icon: Globe, label: "Countries Served", value: "40+", color: "text-emerald-400" },
  { icon: Lock, label: "Uptime", value: "99.9%", color: "text-blue-400" },
  { icon: Award, label: "Withdrawal Success", value: "100%", color: "text-green-400" },
];

export function TrustStatsBar() {
  return (
    <div className="relative w-full overflow-hidden py-4 border-y border-white/[0.06] bg-white/[0.02] backdrop-blur-sm">
      {/* Left fade */}
      <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
      {/* Right fade */}
      <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

      <motion.div
        className="flex items-center gap-10 whitespace-nowrap"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
      >
        {STATS.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="flex items-center gap-2.5 flex-shrink-0">
              <div className={`w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center`}>
                <Icon className={`w-4 h-4 ${stat.color}`} />
              </div>
              <span className={`text-sm font-bold ${stat.color}`}>{stat.value}</span>
              <span className="text-sm text-muted-foreground">{stat.label}</span>
              <span className="w-1 h-1 rounded-full bg-white/20 ml-2" />
            </div>
          );
        })}
      </motion.div>
    </div>
  );
}
