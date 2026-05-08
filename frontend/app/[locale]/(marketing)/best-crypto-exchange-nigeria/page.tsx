import type { Metadata } from "next";
import { Link } from "@/i18n/routing";
import { CheckCircle, ArrowRight, Star, Shield, TrendingUp, Zap } from "lucide-react";

export const metadata: Metadata = {
  title: "Best Crypto Exchange in Nigeria 2026 — Top Picks & Comparison | DeMourinho Crypto",
  description:
    "Looking for the best crypto exchange in Nigeria? DeMourinho Crypto offers low fees, bank transfer deposits, 40+ trading pairs, and 24/7 support for Nigerian traders.",
  keywords: [
    "best crypto exchange nigeria",
    "cryptocurrency exchange nigeria",
    "buy bitcoin nigeria",
    "crypto trading nigeria",
    "naira crypto exchange",
    "buy usdt nigeria",
  ],
  openGraph: {
    title: "Best Crypto Exchange Nigeria 2026 | DeMourinho Crypto",
    description:
      "Top-rated crypto exchange for Nigerian traders. Low fees, fast withdrawals, bank transfer support. 40+ pairs.",
    type: "article",
  },
  alternates: {
    canonical: "/best-crypto-exchange-nigeria",
  },
};

const features = [
  { icon: Star, label: "Low Trading Fees", desc: "Competitive maker/taker fees — one of the lowest in the Nigerian market." },
  { icon: Shield, label: "Bank Transfer Deposits", desc: "Fund your account via GTBank, UBA, First Bank, Access Bank, and more." },
  { icon: TrendingUp, label: "40+ Trading Pairs", desc: "BTC, ETH, BNB, SOL, XRP, USDT and dozens more — all in one place." },
  { icon: Zap, label: "Instant Execution", desc: "Orders fill in milliseconds with our high-performance matching engine." },
];

const comparison = [
  { feature: "Bank Transfer (Naira)", dm: true, others: "Varies" },
  { feature: "Binary Options", dm: true, others: "Rare" },
  { feature: "Staking up to 120% APR", dm: true, others: "Often lower" },
  { feature: "24/7 Live Support", dm: true, others: "Limited hours" },
  { feature: "Demo Trading", dm: true, others: "Rarely" },
  { feature: "No KYC to Start", dm: true, others: "Usually required" },
];

const faqs = [
  {
    q: "Is crypto trading legal in Nigeria?",
    a: "The CBN issued guidance in 2021 restricting banks from facilitating crypto transactions, but peer-to-peer trading and using dedicated crypto exchanges remains widely practiced. The SEC Nigeria has been working on a regulatory framework. Many Nigerians actively trade on exchanges like DeMourinho Crypto.",
  },
  {
    q: "Can I buy crypto with Naira in Nigeria?",
    a: "Yes. DeMourinho Crypto supports Nigerian bank transfers for deposits. You can fund your USDT wallet and immediately trade any of 40+ crypto pairs.",
  },
  {
    q: "What is the best crypto to buy in Nigeria?",
    a: "Bitcoin (BTC) and USDT are the most popular among Nigerian traders. Bitcoin for appreciation potential, USDT as a dollar-pegged hedge against naira depreciation. Ethereum (ETH) and Binance Coin (BNB) are also widely traded.",
  },
  {
    q: "How do I withdraw my profits in Nigeria?",
    a: "You can withdraw to your Nigerian bank account or send crypto to any external wallet. Withdrawal requests are processed within 24 hours. Bank withdrawals typically arrive within 1–2 business days.",
  },
];

export default function BestCryptoExchangeNigeria() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Hero */}
      <section className="relative py-20 md:py-28 px-4 border-b border-border/50 bg-gradient-to-b from-amber-500/5 to-transparent">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-amber-500/10 border border-amber-500/20 text-amber-400 mb-6">
            🇳🇬 Nigeria Guide · Updated May 2026
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            Best Crypto Exchange<br />
            <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
              in Nigeria 2026
            </span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl leading-relaxed">
            We reviewed the top crypto exchanges available in Nigeria. Here's what Nigerian traders need
            to know — fees, deposits, withdrawal times, and security.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link href="/register">
              <button className="inline-flex items-center gap-2 h-12 px-6 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl transition-colors">
                Start Trading Free <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
            <Link href="/demo">
              <button className="inline-flex items-center gap-2 h-12 px-6 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-medium transition-colors">
                Try Demo Trading
              </button>
            </Link>
          </div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 py-16 space-y-16">
        {/* What to look for */}
        <section>
          <h2 className="text-3xl font-bold mb-6">What to Look for in a Nigerian Crypto Exchange</h2>
          <div className="prose prose-invert max-w-none text-muted-foreground space-y-4 text-base leading-relaxed">
            <p>
              With dozens of exchanges operating in Africa, choosing the right one matters. Nigerian traders
              face unique challenges: currency volatility, bank restrictions, and the need for fast, low-cost
              withdrawals. The best exchange for Nigerian users must tick several specific boxes.
            </p>
            <p>
              First, <strong className="text-foreground">local payment support</strong> is non-negotiable. Can you fund your account with a Nigerian bank transfer
              or mobile money? Second, <strong className="text-foreground">withdrawal reliability</strong> — when you've made profit, can you get it out
              without a 5-day wait? Third, <strong className="text-foreground">trading fees</strong> — these compound over time and eat into returns if
              you're trading actively.
            </p>
            <p>
              DeMourinho Crypto was built with African traders in mind. Every decision — from payment integrations
              to the trading interface — was made for traders in Lagos, Abuja, Port Harcourt, and beyond.
            </p>
          </div>
        </section>

        {/* Feature grid */}
        <section>
          <h2 className="text-3xl font-bold mb-8">Why Nigerian Traders Choose DeMourinho</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map(({ icon: Icon, label, desc }) => (
              <div key={label} className="p-6 rounded-2xl bg-white/5 border border-white/10">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-amber-400" />
                </div>
                <h3 className="font-bold text-base mb-2">{label}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Comparison table */}
        <section>
          <h2 className="text-3xl font-bold mb-8">DeMourinho vs Other Exchanges</h2>
          <div className="rounded-2xl border border-white/10 overflow-hidden">
            <div className="grid grid-cols-3 bg-white/10 px-6 py-3 text-xs font-bold text-muted-foreground uppercase">
              <span>Feature</span>
              <span className="text-amber-400">DeMourinho</span>
              <span>Others</span>
            </div>
            {comparison.map(({ feature, dm, others }) => (
              <div key={feature} className="grid grid-cols-3 px-6 py-4 border-t border-white/5 text-sm">
                <span className="text-muted-foreground">{feature}</span>
                <span className="text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5" /> Yes
                </span>
                <span className="text-muted-foreground">{others}</span>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section>
          <h2 className="text-3xl font-bold mb-8">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map(({ q, a }) => (
              <div key={q} className="p-6 rounded-2xl bg-white/5 border border-white/10">
                <h3 className="font-bold mb-3 text-base">{q}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="text-center py-12 px-6 rounded-3xl bg-gradient-to-r from-amber-600/20 to-orange-600/20 border border-amber-500/30">
          <h2 className="text-3xl font-bold mb-4">Start Trading in Nigeria Today</h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            No KYC required to start. Create your account in 30 seconds, fund via bank transfer, and
            trade 40+ crypto pairs with institutional-grade security.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <button className="inline-flex items-center gap-2 h-12 px-8 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl transition-colors">
                Create Free Account <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
            <Link href="/demo">
              <button className="inline-flex items-center gap-2 h-12 px-6 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-colors">
                Try Demo Trading
              </button>
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
