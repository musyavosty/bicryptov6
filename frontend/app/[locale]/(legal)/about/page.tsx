import React from "react";
import { Shield, Users, Globe, TrendingUp, Zap, Award, Target, Heart } from "lucide-react";

export const metadata = {
  title: "About Us | DeMourinho Crypto",
  description: "DeMourinho Crypto is Africa's premier digital asset exchange — built to empower African traders and investors with world-class tools.",
};

const MILESTONES = [
  { year: "2021", title: "Founded", desc: "DeMourinho Crypto launched with a vision to democratize crypto access across Africa." },
  { year: "2022", title: "1,000 Traders", desc: "Reached our first 1,000 registered users across Nigeria, Ghana, Kenya, and South Africa." },
  { year: "2023", title: "M-Pesa Integration", desc: "Launched M-Pesa deposits — making crypto accessible without bank accounts for the first time." },
  { year: "2024", title: "Multi-Feature Platform", desc: "Launched staking pools, binary options, copy trading, and AI-powered investment plans." },
  { year: "2025", title: "3,200+ Traders", desc: "Expanded to 40+ countries, processed over $2.4M in user deposits, maintaining 99.9% uptime." },
];

const VALUES = [
  { icon: Shield, title: "Security First", desc: "Multi-sig cold storage, AES-256 encryption, and 111%+ reserve ratio at all times.", color: "from-blue-500 to-cyan-500" },
  { icon: Globe, title: "Built for Africa", desc: "M-Pesa, MTN Mobile Money, and local bank support. No SWIFT. No barriers.", color: "from-green-500 to-emerald-500" },
  { icon: Heart, title: "Community Driven", desc: "Built by traders, for traders. Every feature comes from real user feedback.", color: "from-red-500 to-rose-500" },
  { icon: Target, title: "Transparent", desc: "Monthly proof-of-reserves audits. Zero hidden fees. What you see is what you get.", color: "from-amber-500 to-orange-500" },
  { icon: Zap, title: "Innovation", desc: "AI investment plans, copy trading, and DeFi yield — staying ahead so you do too.", color: "from-purple-500 to-violet-500" },
  { icon: Award, title: "Excellence", desc: "Up to 95% binary options payout, 120% staking APR, and 0.05% trading fees.", color: "from-amber-400 to-yellow-400" },
];

export default function About() {
  return (
    <div className="min-h-screen py-20 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Hero */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 text-amber-400 mb-5">
            Africa&apos;s Premier Digital Exchange
          </span>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            About{" "}
            <span className="bg-gradient-to-r from-amber-400 via-yellow-300 to-orange-400 bg-clip-text text-transparent">
              DeMourinho Crypto
            </span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            We started with one simple belief: every African deserves access to the same financial tools
            that the world&apos;s wealthiest investors use. No gatekeeping. No minimums. No excuses.
          </p>
        </div>

        {/* Mission */}
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 mb-12 text-center">
          <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
          <p className="text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            To build Africa&apos;s most trusted and accessible cryptocurrency platform — enabling every trader,
            from Lagos to Nairobi to Johannesburg, to grow, protect, and multiply their wealth through
            smart, secure, and transparent digital asset tools.
          </p>
        </div>

        {/* Values */}
        <div className="mb-14">
          <h2 className="text-2xl font-bold text-center mb-8">What We Stand For</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {VALUES.map((v, i) => {
              const Icon = v.icon;
              return (
                <div key={i} className="rounded-2xl border border-white/10 bg-white/5 p-5 hover:bg-white/8 transition-colors">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${v.color} flex items-center justify-center mb-4`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-bold mb-2">{v.title}</h3>
                  <p className="text-sm text-muted-foreground">{v.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Timeline */}
        <div className="mb-14">
          <h2 className="text-2xl font-bold text-center mb-10">Our Journey</h2>
          <div className="relative">
            <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-amber-500/50 via-orange-500/30 to-transparent" />
            <div className="space-y-8">
              {MILESTONES.map((m, i) => (
                <div key={i} className={`flex gap-6 ${i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"}`}>
                  <div className="flex-1 hidden md:block" />
                  <div className="relative flex-shrink-0 w-12 flex justify-center">
                    <div className="w-4 h-4 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 mt-1 ring-4 ring-background" />
                  </div>
                  <div className="flex-1">
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                      <span className="text-xs font-bold text-amber-400 tracking-wider">{m.year}</span>
                      <h3 className="font-bold mt-1 mb-2">{m.title}</h3>
                      <p className="text-sm text-muted-foreground">{m.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-14">
          {[
            { value: "3,200+", label: "Active Traders" },
            { value: "$2.4M+", label: "Funds Secured" },
            { value: "40+", label: "Countries" },
            { value: "99.9%", label: "Uptime" },
          ].map((s, i) => (
            <div key={i} className="rounded-2xl border border-white/10 bg-white/5 p-5 text-center">
              <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent mb-1">{s.value}</div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Team note */}
        <div className="rounded-3xl border border-amber-500/20 bg-amber-500/5 p-8 text-center">
          <Users className="w-10 h-10 text-amber-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-3">Built by a Pan-African Team</h2>
          <p className="text-muted-foreground text-sm leading-relaxed max-w-xl mx-auto">
            Our team spans Lagos, Accra, Nairobi, Cape Town, and Casablanca.
            We are engineers, traders, compliance experts, and community builders united by a single goal:
            financial empowerment for Africa.
          </p>
        </div>
      </div>
    </div>
  );
}
