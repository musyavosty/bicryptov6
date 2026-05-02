"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus, HelpCircle } from "lucide-react";

const FAQS = [
  {
    q: "How do I deposit funds on DeMourinho Crypto?",
    a: "You can deposit via M-Pesa, bank transfer, or cryptocurrency. M-Pesa deposits are processed instantly. Bank transfers arrive within 1–2 business days. Crypto deposits confirm after 1–3 network confirmations — usually under 10 minutes.",
  },
  {
    q: "What is the minimum amount to start staking?",
    a: "You can start staking with as little as $25 in our flexible USDT pool. The DM VIP Premium Pool (120% APR) requires a minimum of $500. All pools pay earnings daily directly to your wallet.",
  },
  {
    q: "How do binary options payouts work?",
    a: "Binary options are simple yes/no predictions on price direction. If your prediction is correct, you earn up to 95% profit on your stake. For example, stake $100 on BTC going UP in 5 minutes — if correct, you receive $195 total ($100 stake + $95 profit).",
  },
  {
    q: "How long do withdrawals take?",
    a: "Crypto withdrawals process within 10–30 minutes after admin approval. M-Pesa withdrawals typically arrive within minutes once approved. We process withdrawal requests within 1–4 hours during business hours, 24/7.",
  },
  {
    q: "Is KYC required to trade?",
    a: "No KYC is required to start trading, staking, or earning on DeMourinho Crypto. You can register with just an email and begin immediately. KYC verification is optional and unlocks higher withdrawal limits.",
  },
  {
    q: "How does the referral program work?",
    a: "Share your unique referral link. When someone registers and trades using your link, you earn 0.8% of their trading volume automatically. For staking, you earn 5% of their staking rewards. Commissions are paid daily into your wallet.",
  },
  {
    q: "Are my funds safe on DeMourinho Crypto?",
    a: "Yes. User funds are held in segregated cold storage wallets, never commingled with platform funds. We use military-grade AES-256 encryption, multi-signature wallet authorization, and DDoS protection. Our platform maintains 99.9% uptime.",
  },
  {
    q: "What is copy trading?",
    a: "Copy trading lets you automatically mirror the trades of top-performing traders on our platform. When a master trader you follow places a trade, the same trade is replicated proportionally in your account. You earn their profits, they earn a small commission.",
  },
];

function FAQItem({ q, a, isOpen, onClick }: { q: string; a: string; isOpen: boolean; onClick: () => void }) {
  return (
    <div
      className={`rounded-2xl border transition-colors cursor-pointer ${isOpen ? "border-amber-500/30 bg-amber-500/5" : "border-white/10 bg-white/5 hover:bg-white/8"}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between gap-4 p-5">
        <h4 className="font-semibold text-sm md:text-base text-foreground">{q}</h4>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${isOpen ? "bg-amber-500 text-white" : "bg-white/10"}`}>
          {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
        </div>
      </div>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <p className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function FAQSection() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="relative py-20 overflow-hidden">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 text-amber-400 mb-4">
            <HelpCircle className="w-4 h-4" />
            Frequently Asked Questions
          </span>
          <h2 className="text-3xl md:text-4xl font-bold">
            Everything you need to{" "}
            <span className="bg-gradient-to-r from-amber-400 via-yellow-300 to-orange-400 bg-clip-text text-transparent">
              know
            </span>
          </h2>
        </motion.div>

        <div className="max-w-3xl mx-auto space-y-3">
          {FAQS.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              viewport={{ once: true }}
            >
              <FAQItem
                q={faq.q}
                a={faq.a}
                isOpen={open === i}
                onClick={() => setOpen(open === i ? null : i)}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
