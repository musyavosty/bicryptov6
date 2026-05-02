"use client";

import React from "react";
import { motion } from "framer-motion";

const ECOSYSTEM = [
  { label: "Bitcoin", ticker: "BTC", color: "#F7931A" },
  { label: "Ethereum", ticker: "ETH", color: "#627EEA" },
  { label: "Tether", ticker: "USDT", color: "#26A17B" },
  { label: "BNB Chain", ticker: "BNB", color: "#F3BA2F" },
  { label: "Solana", ticker: "SOL", color: "#9945FF" },
  { label: "Ripple", ticker: "XRP", color: "#346AA9" },
  { label: "M-Pesa", ticker: "M-Pesa", color: "#00B140" },
  { label: "MTN MoMo", ticker: "MTN", color: "#FFCC00" },
  { label: "Polygon", ticker: "MATIC", color: "#8247E5" },
  { label: "Chainlink", ticker: "LINK", color: "#375BD2" },
  { label: "Dogecoin", ticker: "DOGE", color: "#C3A634" },
  { label: "Cardano", ticker: "ADA", color: "#0033AD" },
  // Repeat for seamless loop
  { label: "Bitcoin", ticker: "BTC", color: "#F7931A" },
  { label: "Ethereum", ticker: "ETH", color: "#627EEA" },
  { label: "Tether", ticker: "USDT", color: "#26A17B" },
  { label: "BNB Chain", ticker: "BNB", color: "#F3BA2F" },
  { label: "Solana", ticker: "SOL", color: "#9945FF" },
  { label: "Ripple", ticker: "XRP", color: "#346AA9" },
  { label: "M-Pesa", ticker: "M-Pesa", color: "#00B140" },
  { label: "MTN MoMo", ticker: "MTN", color: "#FFCC00" },
  { label: "Polygon", ticker: "MATIC", color: "#8247E5" },
  { label: "Chainlink", ticker: "LINK", color: "#375BD2" },
  { label: "Dogecoin", ticker: "DOGE", color: "#C3A634" },
  { label: "Cardano", ticker: "ADA", color: "#0033AD" },
];

export function EcosystemStrip() {
  return (
    <div className="relative py-8 border-y border-white/[0.05] overflow-hidden">
      <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-background to-transparent z-10" />
      <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-background to-transparent z-10" />

      <motion.div
        className="flex items-center gap-8 whitespace-nowrap"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
      >
        {ECOSYSTEM.map((item, i) => (
          <div
            key={i}
            className="flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
          >
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black text-white flex-shrink-0"
              style={{ background: item.color }}
            >
              {item.ticker.slice(0, 1)}
            </div>
            <span className="text-sm font-semibold text-foreground/80">{item.label}</span>
            <span className="text-xs text-muted-foreground">{item.ticker}</span>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
