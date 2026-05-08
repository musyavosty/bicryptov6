import type { Metadata } from "next";
import { Link } from "@/i18n/routing";
import { CheckCircle, ArrowRight, Wallet, Shield, TrendingUp } from "lucide-react";

export const metadata: Metadata = {
  title: "Buy USDT in Ghana 2026 — Fast, Low Fees, Mobile Money | DeMourinho Crypto",
  description:
    "Buy USDT (Tether) in Ghana using MTN Mobile Money or bank transfer. Instant delivery, low fees, no large minimum. Ghana's easiest way to buy stablecoins.",
  keywords: [
    "buy usdt ghana",
    "tether ghana",
    "buy stablecoin ghana",
    "usdt momo ghana",
    "crypto ghana",
    "buy usdt mobile money ghana",
  ],
  openGraph: {
    title: "Buy USDT in Ghana 2026 | DeMourinho Crypto",
    description:
      "Buy USDT with MTN Mobile Money or bank transfer in Ghana. Instant delivery, low fees, 24/7 support.",
    type: "article",
  },
  alternates: {
    canonical: "/buy-usdt-ghana",
  },
};

const steps = [
  {
    num: "01",
    title: "Create a Free Account",
    desc: "Register with just your email. Takes 30 seconds. No ID required to start.",
  },
  {
    num: "02",
    title: "Deposit via MTN MoMo or Bank",
    desc: "Use MTN Mobile Money or a Ghanaian bank transfer to fund your account. Deposits typically confirm in 1–5 minutes.",
  },
  {
    num: "03",
    title: "Buy USDT Instantly",
    desc: "Navigate to Wallet → Deposit → USDT. Your USDT is credited immediately after deposit confirmation.",
  },
  {
    num: "04",
    title: "Use, Trade, or Earn",
    desc: "Use USDT to trade other crypto, stake for yields up to 120% APR, or hold as a dollar-equivalent store of value.",
  },
];

const faqs = [
  {
    q: "What is USDT and why do Ghanaians buy it?",
    a: "USDT (Tether) is a stablecoin pegged 1:1 to the US dollar. It's one of the most traded cryptocurrencies globally. Ghanaians use USDT to hedge against cedi depreciation, receive international payments, and trade other cryptocurrencies without converting back to fiat each time.",
  },
  {
    q: "Can I buy USDT with MTN Mobile Money in Ghana?",
    a: "Yes. DeMourinho Crypto supports MTN Mobile Money (MoMo) deposits. Use the details provided in your account dashboard to send from your MoMo wallet.",
  },
  {
    q: "Is there a minimum amount to buy USDT?",
    a: "No large minimum. You can buy USDT worth as little as $5. There is no requirement to buy a specific amount.",
  },
  {
    q: "How quickly will I receive my USDT?",
    a: "MTN MoMo deposits are typically confirmed within 1–5 minutes. Bank transfers may take up to 30 minutes on weekdays. USDT is credited as soon as the deposit is confirmed.",
  },
  {
    q: "Can I send USDT to another wallet?",
    a: "Yes. You can withdraw USDT to any external wallet (TRC-20, ERC-20) directly from your DeMourinho account at any time.",
  },
  {
    q: "Is my money safe on DeMourinho?",
    a: "Yes. DeMourinho uses industry-standard security: SSL encryption, cold storage, multi-signature withdrawals, and mandatory 2FA. We recommend enabling 2FA immediately after registration.",
  },
];

export default function BuyUSDTGhana() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Hero */}
      <section className="relative py-20 md:py-28 px-4 border-b border-border/50 bg-gradient-to-b from-amber-500/5 to-transparent">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-amber-500/10 border border-amber-500/20 text-amber-400 mb-6">
            🇬🇭 Ghana Guide · Updated May 2026
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            Buy USDT in Ghana<br />
            <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
              with Mobile Money
            </span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl leading-relaxed">
            The fastest, simplest way to buy USDT (Tether) in Ghana — using MTN Mobile Money or
            bank transfer. Instant delivery, low fees, no large minimum.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link href="/register">
              <button className="inline-flex items-center gap-2 h-12 px-6 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl transition-colors">
                Buy USDT Now <ArrowRight className="w-4 h-4" />
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
        {/* Why USDT */}
        <section>
          <h2 className="text-3xl font-bold mb-6">Why Ghanaians Are Buying USDT</h2>
          <div className="prose prose-invert max-w-none text-muted-foreground space-y-4 text-base leading-relaxed">
            <p>
              The Ghana cedi has faced significant depreciation pressure in recent years. Many Ghanaians
              are turning to USDT — a digital dollar — as a way to protect their savings from local currency
              volatility.
            </p>
            <p>
              Unlike Bitcoin, USDT doesn't fluctuate in price. One USDT is always worth approximately
              one US dollar. This makes it ideal for storing savings in dollars, receiving payments from
              abroad, and trading other crypto assets without converting back to cedi between trades.
            </p>
            <p>
              With DeMourinho Crypto's mobile money integration, buying USDT in Ghana is as simple as
              sending an M-Pesa payment. The entire process takes under 5 minutes.
            </p>
          </div>
        </section>

        {/* Steps */}
        <section>
          <h2 className="text-3xl font-bold mb-10">How to Buy USDT in Ghana — Step by Step</h2>
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

        {/* Benefits */}
        <section>
          <h2 className="text-3xl font-bold mb-8">Benefits of Buying USDT on DeMourinho</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: Wallet, title: "Mobile Money Ready", desc: "Deposit via MTN MoMo. No bank account required. Funds reflect instantly." },
              { icon: Shield, title: "Secure Storage", desc: "Your USDT is held in a secure, insured wallet. Withdraw to any external address anytime." },
              { icon: TrendingUp, title: "Earn on USDT", desc: "Stake your USDT for competitive APR yields while you hold. Your dollars work for you." },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="p-6 rounded-2xl bg-white/5 border border-white/10">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-amber-400" />
                </div>
                <h3 className="font-bold text-base mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Safety tips */}
        <section>
          <h2 className="text-3xl font-bold mb-6">Staying Safe When Buying Crypto in Ghana</h2>
          <div className="space-y-3">
            {[
              "Only use established, registered exchanges — not random Telegram or WhatsApp sellers.",
              "Enable two-factor authentication (2FA) immediately after registering.",
              "Never share your password or seed phrase with anyone.",
              "Double-check wallet addresses before withdrawing. Crypto transactions are irreversible.",
              "Start with small amounts until you're comfortable with the process.",
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
          <h2 className="text-3xl font-bold mb-4">Buy USDT in Ghana Today</h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Join thousands of Ghanaian traders protecting their savings with USDT. Sign up free,
            deposit via MTN MoMo, and get your USDT in minutes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <button className="inline-flex items-center gap-2 h-12 px-8 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl transition-colors">
                Get Started Free <ArrowRight className="w-4 h-4" />
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
