"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, Coins, ArrowUpRight, Wallet, Users, Star } from "lucide-react";

const ACTIVITIES = [
  { name: "James M.", city: "Nairobi, KE", action: "deposited", amount: "$500", detail: "via M-Pesa", type: "deposit" },
  { name: "Amara O.", city: "Lagos, NG", action: "earned", amount: "$127.40", detail: "in staking rewards", type: "staking" },
  { name: "Fatima A.", city: "Cairo, EG", action: "won", amount: "$340", detail: "on binary options", type: "binary" },
  { name: "Kwame A.", city: "Accra, GH", action: "deposited", amount: "$200", detail: "via bank transfer", type: "deposit" },
  { name: "Chioma N.", city: "Abuja, NG", action: "staked", amount: "$1,000", detail: "at 120% APR", type: "staking" },
  { name: "David K.", city: "Kampala, UG", action: "withdrew", amount: "$890", detail: "to M-Pesa instantly", type: "withdraw" },
  { name: "Aisha B.", city: "Dakar, SN", action: "earned", amount: "$56.20", detail: "in referral bonuses", type: "referral" },
  { name: "Samuel T.", city: "Addis Ababa, ET", action: "deposited", amount: "$750", detail: "via crypto", type: "deposit" },
  { name: "Grace M.", city: "Nairobi, KE", action: "won", amount: "$189", detail: "on binary options", type: "binary" },
  { name: "Emeka O.", city: "Port Harcourt, NG", action: "staked", amount: "$2,500", detail: "in VIP pool", type: "staking" },
  { name: "Blessing A.", city: "Ibadan, NG", action: "deposited", amount: "$300", detail: "via M-Pesa", type: "deposit" },
  { name: "Mohamed A.", city: "Casablanca, MA", action: "earned", amount: "$412", detail: "trading forex", type: "binary" },
  { name: "Priya S.", city: "Johannesburg, ZA", action: "staked", amount: "$5,000", detail: "at 60% APR", type: "staking" },
  { name: "Kevin O.", city: "Nairobi, KE", action: "referred", amount: "3 friends", detail: "earned $45 bonus", type: "referral" },
  { name: "Zanele M.", city: "Durban, ZA", action: "deposited", amount: "$1,200", detail: "via bank transfer", type: "deposit" },
];

const TYPE_CONFIG = {
  deposit: { icon: Wallet, color: "emerald", bg: "bg-emerald-500/20", text: "text-emerald-400", border: "border-emerald-500/30" },
  staking: { icon: Coins, color: "green", bg: "bg-green-500/20", text: "text-green-400", border: "border-green-500/30" },
  binary:  { icon: TrendingUp, color: "amber", bg: "bg-amber-500/20", text: "text-amber-400", border: "border-amber-500/30" },
  withdraw:{ icon: ArrowUpRight, color: "blue", bg: "bg-blue-500/20", text: "text-blue-400", border: "border-blue-500/30" },
  referral:{ icon: Users, color: "rose", bg: "bg-rose-500/20", text: "text-rose-400", border: "border-rose-500/30" },
};

function getTimeAgo() {
  const seconds = Math.floor(Math.random() * 55) + 5;
  if (seconds < 60) return `${seconds}s ago`;
  return `${Math.floor(seconds / 60)}m ago`;
}

export function SocialProofToast() {
  const [visible, setVisible] = useState(false);
  const [activity, setActivity] = useState(ACTIVITIES[0]);
  const [timeAgo, setTimeAgo] = useState("12s ago");
  const [index, setIndex] = useState(0);

  const showNext = useCallback(() => {
    const next = (index + 1) % ACTIVITIES.length;
    setIndex(next);
    setActivity(ACTIVITIES[next]);
    setTimeAgo(getTimeAgo());
    setVisible(true);

    setTimeout(() => setVisible(false), 4500);
  }, [index]);

  useEffect(() => {
    const initialDelay = setTimeout(() => {
      showNext();
    }, 3000);

    return () => clearTimeout(initialDelay);
  }, []);

  useEffect(() => {
    if (!visible) {
      const interval = setTimeout(() => {
        showNext();
      }, Math.floor(Math.random() * 8000) + 12000);
      return () => clearTimeout(interval);
    }
  }, [visible, showNext]);

  const config = TYPE_CONFIG[activity.type as keyof typeof TYPE_CONFIG] || TYPE_CONFIG.deposit;
  const Icon = config.icon;

  return (
    <div className="fixed bottom-6 left-6 z-50 pointer-events-none">
      <AnimatePresence>
        {visible && (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -60, y: 10 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: -40, y: 5 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={`
              flex items-center gap-3 px-4 py-3 rounded-2xl max-w-[280px]
              bg-background/90 backdrop-blur-xl border ${config.border}
              shadow-2xl shadow-black/40
            `}
          >
            <div className={`w-10 h-10 rounded-xl ${config.bg} flex items-center justify-center flex-shrink-0`}>
              <Icon className={`w-5 h-5 ${config.text}`} />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold text-foreground truncate">
                <span className={config.text}>{activity.name}</span>
                {" "}<span className="text-muted-foreground font-normal">{activity.city}</span>
              </div>
              <div className="text-xs text-foreground/80 leading-tight">
                {activity.action}{" "}
                <span className="font-bold text-foreground">{activity.amount}</span>{" "}
                <span className="text-muted-foreground">{activity.detail}</span>
              </div>
              <div className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1">
                <span className="inline-flex w-1.5 h-1.5 rounded-full bg-emerald-400" />
                {timeAgo}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
