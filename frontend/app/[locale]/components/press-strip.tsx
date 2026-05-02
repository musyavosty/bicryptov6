"use client";

import React from "react";
import { motion } from "framer-motion";

const PRESS_ITEMS = [
  { name: "CoinDesk", text: "COINDESK" },
  { name: "CoinTelegraph", text: "COINTELEGRAPH" },
  { name: "Reuters", text: "REUTERS" },
  { name: "TechCrunch", text: "TECHCRUNCH" },
  { name: "Bloomberg Crypto", text: "BLOOMBERG" },
  { name: "Decrypt", text: "DECRYPT" },
  { name: "The Block", text: "THE BLOCK" },
  { name: "CoinDesk", text: "COINDESK" },
  { name: "CoinTelegraph", text: "COINTELEGRAPH" },
  { name: "Reuters", text: "REUTERS" },
  { name: "TechCrunch", text: "TECHCRUNCH" },
  { name: "Bloomberg Crypto", text: "BLOOMBERG" },
  { name: "Decrypt", text: "DECRYPT" },
  { name: "The Block", text: "THE BLOCK" },
];

export function PressStrip() {
  return (
    <div className="relative py-10 border-y border-white/[0.05]">
      <div className="text-center mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground/60">
          As featured in
        </p>
      </div>

      <div className="relative overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-background to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-background to-transparent z-10" />

        <motion.div
          className="flex items-center gap-12 whitespace-nowrap"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
        >
          {PRESS_ITEMS.map((item, i) => (
            <div key={i} className="flex-shrink-0 flex items-center gap-2 opacity-30 hover:opacity-60 transition-opacity">
              <span className="text-base font-black tracking-widest text-foreground">
                {item.text}
              </span>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
