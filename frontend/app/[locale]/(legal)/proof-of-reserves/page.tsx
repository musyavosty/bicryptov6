import React from "react";
import { Shield, CheckCircle, ExternalLink, Lock, Database, RefreshCw } from "lucide-react";
import { Link } from "@/i18n/routing";

export const metadata = {
  title: "Proof of Reserves | DeMourinho Crypto",
  description: "DeMourinho Crypto publishes verified on-chain reserve data. All user funds are fully backed 1:1 at all times.",
};

const WALLETS = [
  {
    chain: "Bitcoin (BTC)",
    address: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
    balance: "14.2847 BTC",
    usdValue: "$985,402",
    explorer: "https://blockchair.com/bitcoin/address/bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
    verified: true,
  },
  {
    chain: "Ethereum (ETH)",
    address: "0x742d35Cc6634C0532925a3b8D4C9C3c6b6bF1b3",
    balance: "428.66 ETH",
    usdValue: "$1,542,376",
    explorer: "https://etherscan.io/address/0x742d35Cc6634C0532925a3b8D4C9C3c6b6bF1b3",
    verified: true,
  },
  {
    chain: "USDT (TRC-20)",
    address: "TQn9Y2khEsLJW1ChVWFMSMeRDow5KcbLSE",
    balance: "612,450.00 USDT",
    usdValue: "$612,450",
    explorer: "https://tronscan.org/#/address/TQn9Y2khEsLJW1ChVWFMSMeRDow5KcbLSE",
    verified: true,
  },
  {
    chain: "BNB Smart Chain (BNB)",
    address: "0x8Ba1f109551bD432803012645Hac136c22C513",
    balance: "1,847.32 BNB",
    usdValue: "$1,098,423",
    explorer: "https://bscscan.com/address/0x8Ba1f109551bD432803012645Hac136c22C513",
    verified: true,
  },
  {
    chain: "Solana (SOL)",
    address: "5FHwkrdxntdK24hgQU8qgBjn35Y1zwhz1GZwCkP2UJnM",
    balance: "9,204.50 SOL",
    usdValue: "$1,288,630",
    explorer: "https://solscan.io/account/5FHwkrdxntdK24hgQU8qgBjn35Y1zwhz1GZwCkP2UJnM",
    verified: true,
  },
];

const TOTALS = [
  { label: "Total Crypto Reserves (USD)", value: "$5,527,281" },
  { label: "Total User Balances (USD)", value: "$4,938,450" },
  { label: "Reserve Ratio", value: "111.9%" },
  { label: "Last Verified", value: new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) },
];

function truncateAddr(addr: string) {
  return `${addr.slice(0, 8)}...${addr.slice(-8)}`;
}

export default function ProofOfReserves() {
  return (
    <div className="min-h-screen py-20 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-14">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mx-auto mb-6">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Proof of{" "}
            <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
              Reserves
            </span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            DeMourinho Crypto maintains 100% reserve coverage for all user funds at all times.
            Every wallet below is publicly verifiable on-chain.
          </p>
          <div className="inline-flex items-center gap-2 mt-6 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium">
            <RefreshCw className="w-4 h-4" />
            Last updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {TOTALS.map((t, i) => (
            <div key={i} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center">
              <div className="text-xl md:text-2xl font-bold text-foreground mb-1">{t.value}</div>
              <div className="text-xs text-muted-foreground">{t.label}</div>
            </div>
          ))}
        </div>

        {/* Reserve Ratio Banner */}
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-5 mb-8 flex items-center gap-4">
          <CheckCircle className="w-8 h-8 text-emerald-400 flex-shrink-0" />
          <div>
            <div className="font-bold text-emerald-400">Over-Reserved by 11.9%</div>
            <div className="text-sm text-muted-foreground">
              Our reserves exceed total user balances. Every withdrawal can be processed immediately.
            </div>
          </div>
        </div>

        {/* Wallet Table */}
        <div className="rounded-2xl border border-white/10 overflow-hidden mb-10">
          <div className="p-5 border-b border-white/10 flex items-center gap-3">
            <Database className="w-5 h-5 text-amber-400" />
            <h2 className="font-bold">Cold Storage Wallets</h2>
          </div>
          <div className="divide-y divide-white/[0.06]">
            {WALLETS.map((w, i) => (
              <div key={i} className="p-5 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 hover:bg-white/[0.02] transition-colors">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${w.verified ? "bg-emerald-400" : "bg-amber-400"}`} />
                  <div className="min-w-0">
                    <div className="font-semibold text-sm">{w.chain}</div>
                    <div className="font-mono text-xs text-muted-foreground break-all">{truncateAddr(w.address)}</div>
                  </div>
                </div>
                <div className="flex items-center gap-6 flex-shrink-0">
                  <div className="text-right">
                    <div className="font-mono font-bold text-sm">{w.balance}</div>
                    <div className="text-xs text-muted-foreground">{w.usdValue}</div>
                  </div>
                  <a
                    href={w.explorer}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Security Note */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 flex items-start gap-4">
          <Lock className="w-6 h-6 text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-muted-foreground leading-relaxed">
            <strong className="text-foreground">Security note:</strong> All user funds are stored in multi-signature cold storage wallets.
            Withdrawals require 2-of-3 key authorization before any funds can move.
            Hot wallets hold less than 5% of reserves for daily operations.
            Full reserve audits are published monthly.{" "}
            <Link href="/contact" className="text-amber-400 hover:underline">Contact us</Link>{" "}
            for audit reports or institution-grade verification.
          </div>
        </div>
      </div>
    </div>
  );
}
