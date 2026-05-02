"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react";

const TESTIMONIALS = [
  {
    name: "Grace Mwangi",
    location: "Nairobi, Kenya",
    role: "Staking Investor",
    avatar: "GM",
    color: "from-emerald-500 to-teal-500",
    stars: 5,
    profit: "+$840",
    period: "last month",
    text: "I deposited via M-Pesa and within hours I was staking USDT at 60% APR. The returns hit my wallet every single day. This is the future of wealth building in Africa.",
  },
  {
    name: "Emeka Okafor",
    location: "Lagos, Nigeria",
    role: "Binary Options Trader",
    avatar: "EO",
    color: "from-amber-500 to-orange-500",
    stars: 5,
    profit: "+$1,240",
    period: "this week",
    text: "The binary options platform is clean and fast. 92% payout on Rise/Fall is unmatched anywhere else. I made $1,240 in a week of part-time trading around my day job.",
  },
  {
    name: "Amara Diallo",
    location: "Dakar, Senegal",
    role: "Referral Earner",
    avatar: "AD",
    color: "from-purple-500 to-pink-500",
    stars: 5,
    profit: "+$320",
    period: "passive income",
    text: "I shared my referral link in two WhatsApp groups. Within a month I have 14 people staking and trading under me. The commissions come in automatically — pure passive income.",
  },
  {
    name: "Fatima Al-Hassan",
    location: "Cairo, Egypt",
    role: "Crypto Trader",
    avatar: "FA",
    color: "from-blue-500 to-cyan-500",
    stars: 5,
    profit: "+$560",
    period: "first 2 weeks",
    text: "The spot trading fees are incredibly low at 0.08%. I was paying 10x that on Binance. DeMourinho Crypto gives me more of my profits and the interface is beautiful.",
  },
  {
    name: "Samuel Tekeste",
    location: "Addis Ababa, Ethiopia",
    role: "VIP Pool Member",
    avatar: "ST",
    color: "from-amber-500 to-yellow-400",
    stars: 5,
    profit: "+$2,100",
    period: "in 3 months",
    text: "The DM VIP Premium Pool at 120% APR seemed too good to be true. Three months in, I have earned over $2,100 on my $5,000 stake. Withdrawals are instant. Trust is earned.",
  },
  {
    name: "Zanele Mokoena",
    location: "Johannesburg, South Africa",
    role: "Day Trader",
    avatar: "ZM",
    color: "from-rose-500 to-pink-500",
    stars: 5,
    profit: "+$980",
    period: "monthly average",
    text: "I tried four exchanges before DeMourinho. None of them had binary options AND staking AND low fees together. This platform is built for serious African traders.",
  },
];

function StarRating({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
      ))}
    </div>
  );
}

export function TestimonialsSection() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);
  const intervalRef = useRef<ReturnType<typeof setInterval>>(null);

  const go = (dir: number) => {
    setDirection(dir);
    setCurrent((c) => (c + dir + TESTIMONIALS.length) % TESTIMONIALS.length);
  };

  useEffect(() => {
    intervalRef.current = setInterval(() => go(1), 6000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  const t = TESTIMONIALS[current];

  return (
    <section className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-amber-600/5 to-transparent" />

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 text-amber-400 mb-4">
            <Star className="w-4 h-4 fill-amber-400" />
            Real Traders, Real Results
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold">
            Trusted by Traders{" "}
            <span className="bg-gradient-to-r from-amber-400 via-yellow-300 to-orange-400 bg-clip-text text-transparent">
              Across Africa
            </span>
          </h2>
        </motion.div>

        <div className="max-w-3xl mx-auto">
          {/* Main card */}
          <div className="relative min-h-[280px]">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={current}
                custom={direction}
                initial={{ opacity: 0, x: direction * 80 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: direction * -80 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="absolute inset-0"
              >
                <div className="h-full rounded-3xl border border-white/10 bg-white/5 backdrop-blur-sm p-8 md:p-10">
                  <Quote className="w-8 h-8 text-amber-400/40 mb-4" />

                  <p className="text-lg md:text-xl text-foreground/90 leading-relaxed mb-8 font-light italic">
                    "{t.text}"
                  </p>

                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${t.color} flex items-center justify-center text-white font-bold text-lg flex-shrink-0`}>
                        {t.avatar}
                      </div>
                      <div>
                        <div className="font-bold text-foreground">{t.name}</div>
                        <div className="text-sm text-muted-foreground">{t.location} · {t.role}</div>
                        <StarRating count={t.stars} />
                      </div>
                    </div>
                    <div className={`px-5 py-3 rounded-2xl bg-gradient-to-r ${t.color} text-white text-center`}>
                      <div className="text-2xl font-bold">{t.profit}</div>
                      <div className="text-xs text-white/80">{t.period}</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <button
              onClick={() => go(-1)}
              className="w-10 h-10 rounded-full border border-white/20 bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="flex gap-2">
              {TESTIMONIALS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => { setDirection(i > current ? 1 : -1); setCurrent(i); }}
                  className={`h-2 rounded-full transition-all ${i === current ? "w-8 bg-amber-400" : "w-2 bg-white/20 hover:bg-white/40"}`}
                />
              ))}
            </div>

            <button
              onClick={() => go(1)}
              className="w-10 h-10 rounded-full border border-white/20 bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Mini grid of other testimonials */}
          <div className="grid grid-cols-3 gap-3 mt-8">
            {TESTIMONIALS.filter((_, i) => i !== current).slice(0, 3).map((t2, i) => (
              <motion.div
                key={`${current}-${i}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-3 rounded-2xl border border-white/10 bg-white/5 cursor-pointer hover:bg-white/10 transition-colors"
                onClick={() => {
                  const idx = TESTIMONIALS.indexOf(t2);
                  setDirection(idx > current ? 1 : -1);
                  setCurrent(idx);
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${t2.color} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                    {t2.avatar}
                  </div>
                  <div className="text-xs font-semibold truncate">{t2.name.split(" ")[0]}</div>
                </div>
                <div className="text-xs font-bold text-emerald-400">{t2.profit}</div>
                <div className="text-[10px] text-muted-foreground truncate">{t2.period}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
