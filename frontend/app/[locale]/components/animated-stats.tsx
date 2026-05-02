"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Users, Shield, Globe, TrendingUp, Zap, Clock } from "lucide-react";

const STATS = [
  { icon: Users, value: 3200, suffix: "+", label: "Active Traders", sublabel: "across 40 countries", color: "from-amber-500 to-orange-500" },
  { icon: Shield, value: 2.4, suffix: "M+", prefix: "$", label: "Funds Secured", sublabel: "in verified wallets", color: "from-emerald-500 to-teal-500" },
  { icon: TrendingUp, value: 95, suffix: "%", label: "Max Binary Payout", sublabel: "industry-leading rate", color: "from-purple-500 to-pink-500" },
  { icon: Globe, value: 120, suffix: "%", label: "Max Staking APR", sublabel: "VIP premium pool", color: "from-amber-500 to-yellow-400" },
  { icon: Zap, value: 0.08, suffix: "%", label: "Trading Fee", sublabel: "one of the lowest globally", color: "from-blue-500 to-cyan-500" },
  { icon: Clock, value: 99.9, suffix: "%", label: "Platform Uptime", sublabel: "guaranteed availability", color: "from-green-500 to-emerald-500" },
];

function Counter({ target, prefix = "", suffix = "", decimals = 0 }: { target: number; prefix?: string; suffix?: string; decimals?: number }) {
  const [val, setVal] = useState(0);
  const ref = useRef<NodeJS.Timeout | null>(null);
  const inViewRef = useRef<HTMLSpanElement>(null);
  const inView = useInView(inViewRef, { once: true, margin: "-50px" });

  useEffect(() => {
    if (!inView) return;
    const duration = 1800;
    const start = Date.now();
    const step = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setVal(eased * target);
      if (progress < 1) ref.current = setTimeout(step, 16);
    };
    step();
    return () => { if (ref.current) clearTimeout(ref.current); };
  }, [inView, target]);

  const display = decimals > 0 ? val.toFixed(decimals) : Math.floor(val).toLocaleString();

  return (
    <span ref={inViewRef} className="tabular-nums">
      {prefix}{display}{suffix}
    </span>
  );
}

export function AnimatedStats() {
  return (
    <section className="relative py-20 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/[0.02] to-transparent" />
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-muted-foreground">
            The numbers that speak for themselves
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
          {STATS.map((stat, i) => {
            const Icon = stat.icon;
            const decimals = stat.value % 1 !== 0 ? String(stat.value).split(".")[1]?.length || 1 : 0;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                viewport={{ once: true }}
                className="relative group"
              >
                <div className="p-5 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm hover:bg-white/8 transition-colors text-center">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mx-auto mb-3`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-2xl md:text-3xl font-bold text-foreground leading-none mb-1">
                    <Counter
                      target={stat.value}
                      prefix={stat.prefix || ""}
                      suffix={stat.suffix}
                      decimals={decimals}
                    />
                  </div>
                  <div className="text-xs font-semibold text-foreground/80 mb-0.5">{stat.label}</div>
                  <div className="text-[10px] text-muted-foreground">{stat.sublabel}</div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
