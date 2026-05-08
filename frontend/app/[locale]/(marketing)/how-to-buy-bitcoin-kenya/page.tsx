import type { Metadata } from "next";
import { Link } from "@/i18n/routing";
import { CheckCircle, ArrowRight, Shield, Zap, Wallet } from "lucide-react";

export const metadata: Metadata = {
  title: "How to Buy Bitcoin in Kenya 2026 — Fast, Safe, M-Pesa | DeMourinho Crypto",
  description:
    "Step-by-step guide to buying Bitcoin in Kenya using M-Pesa, bank transfer, or card. Buy BTC instantly on DeMourinho Crypto — Africa's leading exchange.",
  keywords: [
    "buy bitcoin kenya",
    "bitcoin kenya mpesa",
    "how to buy btc kenya",
    "buy cryptocurrency kenya",
    "bitcoin nairobi",
  ],
  openGraph: {
    title: "How to Buy Bitcoin in Kenya 2026 | DeMourinho Crypto",
    description:
      "Buy Bitcoin in Kenya using M-Pesa or bank transfer. Fast, secure, low fees. Start with as little as KES 500.",
    type: "article",
  },
  alternates: {
    canonical: "/how-to-buy-bitcoin-kenya",
  },
};

const steps = [
  {
    num: "01",
    title: "Create Your Free Account",
    desc: "Sign up in under 30 seconds. Just your email and a password — no KYC required to start trading.",
  },
  {
    num: "02",
    title: "Deposit via M-Pesa or Bank Transfer",
    desc: "Send funds to your wallet using M-Pesa Paybill, Equity Bank, or KCB. Funds arrive instantly.",
  },
  {
    num: "03",
    title: "Buy Bitcoin",
    desc: "Go to Markets → BTC/USDT. Enter your amount and confirm. Your Bitcoin is credited in seconds.",
  },
  {
    num: "04",
    title: "Store or Trade",
    desc: "Hold Bitcoin in your secure wallet, trade for profit, or stake for up to 120% APR.",
  },
];

const faqs = [
  {
    q: "Is it legal to buy Bitcoin in Kenya?",
    a: "Yes. Cryptocurrency trading is not prohibited in Kenya. The Central Bank of Kenya advises caution but has not banned it. Thousands of Kenyans trade crypto daily.",
  },
  {
    q: "What is the minimum amount to buy Bitcoin in Kenya?",
    a: "On DeMourinho, you can start with as little as $5 worth of Bitcoin. There is no large minimum. You can buy a fraction of a Bitcoin — you do not need to buy a whole coin.",
  },
  {
    q: "Can I buy Bitcoin with M-Pesa?",
    a: "Yes. DeMourinho Crypto supports M-Pesa deposits. Use the Paybill number provided in your account to top up your USDT wallet, then buy BTC instantly.",
  },
  {
    q: "How long does it take to receive Bitcoin after buying?",
    a: "Once your deposit is confirmed, buying Bitcoin is instant. M-Pesa deposits are typically confirmed within 1–5 minutes.",
  },
  {
    q: "Is DeMourinho Crypto safe?",
    a: "Yes. DeMourinho uses multi-layer encryption, cold storage for the majority of funds, and two-factor authentication (2FA) on all accounts.",
  },
];

export default function HowToBuyBitcoinKenya() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Hero */}
      <section className="relative py-20 md:py-28 px-4 border-b border-border/50 bg-gradient-to-b from-amber-500/5 to-transparent">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-amber-500/10 border border-amber-500/20 text-amber-400 mb-6">
            🇰🇪 Kenya Guide · Updated May 2026
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            How to Buy Bitcoin<br />
            <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
              in Kenya
            </span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl leading-relaxed">
            A complete, beginner-friendly guide to buying Bitcoin in Kenya using M-Pesa, bank transfer,
            or card — in under 5 minutes, starting from as little as KES 500.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link href="/register">
              <button className="inline-flex items-center gap-2 h-12 px-6 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl transition-colors">
                Start Buying Bitcoin <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
            <Link href="/demo">
              <button className="inline-flex items-center gap-2 h-12 px-6 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-medium transition-colors">
                Try Demo First
              </button>
            </Link>
          </div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 py-16 space-y-16">
        {/* Why Kenya section */}
        <section>
          <h2 className="text-3xl font-bold mb-6">Why Kenyans Are Buying Bitcoin in 2026</h2>
          <div className="prose prose-invert max-w-none text-muted-foreground space-y-4 text-base leading-relaxed">
            <p>
              Kenya is one of Africa's fastest-growing crypto markets. With a young, mobile-first population
              and one of the world's highest M-Pesa penetration rates, Kenyans have a natural advantage in
              accessing digital assets.
            </p>
            <p>
              Bitcoin has outperformed every major asset class over the past decade. Many Kenyan traders
              use it as a hedge against shilling depreciation, as a remittance tool, and as an investment
              vehicle. The ability to buy fractions of Bitcoin — you don't need to buy a whole coin — makes
              it accessible to anyone.
            </p>
            <p>
              With platforms like DeMourinho Crypto offering M-Pesa integration, the barrier to entry is lower
              than ever. You can go from zero to holding Bitcoin in under 5 minutes.
            </p>
          </div>
        </section>

        {/* Steps */}
        <section>
          <h2 className="text-3xl font-bold mb-10">Step-by-Step: Buy Bitcoin with M-Pesa</h2>
          <div className="space-y-6">
            {steps.map((step, i) => (
              <div key={i} className="flex gap-5 p-6 rounded-2xl bg-white/5 border border-white/10">
                <div className="w-12 h-12 rounded-xl bg-amber-500 text-black font-bold flex items-center justify-center shrink-0 text-sm">
                  {step.num}
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-2">{step.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Why DeMourinho */}
        <section>
          <h2 className="text-3xl font-bold mb-8">Why Kenyans Choose DeMourinho Crypto</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Wallet,
                title: "M-Pesa Native",
                desc: "Deposit and withdraw directly via M-Pesa. No bank account required. Instant confirmation.",
              },
              {
                icon: Shield,
                title: "Military-Grade Security",
                desc: "Cold storage, multi-sig wallets, and 2FA on every account. Your funds are protected.",
              },
              {
                icon: Zap,
                title: "Instant Execution",
                desc: "Trades execute in milliseconds. Buy at the price you see — no slippage on market orders.",
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="p-6 rounded-2xl bg-white/5 border border-white/10">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-amber-400" />
                </div>
                <h3 className="font-bold text-lg mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Tips */}
        <section>
          <h2 className="text-3xl font-bold mb-6">Tips for Buying Bitcoin Safely in Kenya</h2>
          <div className="space-y-3">
            {[
              "Always enable 2FA (two-factor authentication) on your trading account.",
              "Never share your private keys or seed phrases with anyone — not even support staff.",
              "Start small. Practice with a demo account before committing larger amounts.",
              "Dollar-cost averaging (buying small amounts regularly) reduces risk from price swings.",
              "Only use regulated or well-established platforms. Avoid WhatsApp groups promising guaranteed returns.",
              "Withdraw regularly — don't leave large amounts on any exchange longer than needed.",
            ].map((tip, i) => (
              <div key={i} className="flex gap-3 items-start p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <p className="text-sm text-muted-foreground">{tip}</p>
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
          <h2 className="text-3xl font-bold mb-4">Ready to Buy Bitcoin in Kenya?</h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Join thousands of Kenyan traders on DeMourinho Crypto. Sign up free, deposit via M-Pesa,
            and buy your first Bitcoin in under 5 minutes.
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
