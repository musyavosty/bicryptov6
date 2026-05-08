"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Script from "next/script";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "@/i18n/routing";
import {
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  TrendingDown,
  Wallet,
  Clock,
  CheckCircle,
  XCircle,
  ChevronDown,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Trophy,
  Zap,
  Shield,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

const MARKETS = [
  { label: "BTC/USDT", symbol: "BINANCE:BTCUSDT", name: "Bitcoin", color: "amber" },
  { label: "ETH/USDT", symbol: "BINANCE:ETHUSDT", name: "Ethereum", color: "blue" },
  { label: "BNB/USDT", symbol: "BINANCE:BNBUSDT", name: "BNB", color: "yellow" },
  { label: "SOL/USDT", symbol: "BINANCE:SOLUSDT", name: "Solana", color: "purple" },
  { label: "XRP/USDT", symbol: "BINANCE:XRPUSDT", name: "XRP", color: "cyan" },
];

const AMOUNTS = [10, 25, 50, 100, 250, 500];

const DURATIONS = [
  { label: "1 min", seconds: 60 },
  { label: "5 min", seconds: 300 },
  { label: "15 min", seconds: 900 },
];

interface Order {
  id: number;
  market: string;
  direction: "UP" | "DOWN";
  amount: number;
  durationSeconds: number;
  timeLeft: number;
  entryTime: Date;
}

interface HistoryEntry {
  id: number;
  market: string;
  direction: "UP" | "DOWN";
  amount: number;
  won: boolean;
  payout: number;
  profit: number;
}

declare global {
  interface Window {
    TradingView?: any;
  }
}

function formatBalance(n: number) {
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatCountdown(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

export default function DemoTradingClient() {
  const [balance, setBalance] = useState(10000);
  const [startBalance] = useState(10000);
  const [selectedMarket, setSelectedMarket] = useState(MARKETS[0]);
  const [amount, setAmount] = useState(50);
  const [customAmount, setCustomAmount] = useState("");
  const [duration, setDuration] = useState(DURATIONS[0]);
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [chartReady, setChartReady] = useState(false);
  const [marketOpen, setMarketOpen] = useState(false);
  const [pulse, setPulse] = useState<"win" | "lose" | null>(null);
  const [showSignupCTA, setShowSignupCTA] = useState(false);
  const [totalTrades, setTotalTrades] = useState(0);
  const chartContainerId = "dm_demo_chart";
  const widgetRef = useRef<any>(null);
  const ordersRef = useRef<Order[]>([]);

  ordersRef.current = activeOrders;

  const totalPnL = balance - startBalance;

  const initChart = useCallback(() => {
    if (!window.TradingView || widgetRef.current) return;
    try {
      widgetRef.current = new window.TradingView.widget({
        autosize: true,
        symbol: selectedMarket.symbol,
        interval: "1",
        timezone: "Etc/UTC",
        theme: "dark",
        style: "1",
        locale: "en",
        toolbar_bg: "#0a0f1a",
        enable_publishing: false,
        hide_side_toolbar: true,
        allow_symbol_change: false,
        container_id: chartContainerId,
        hide_top_toolbar: false,
        save_image: false,
      });
      setChartReady(true);
    } catch {}
  }, [selectedMarket.symbol]);

  const switchChart = useCallback((market: typeof MARKETS[0]) => {
    if (widgetRef.current) {
      try { widgetRef.current.remove(); } catch {}
      widgetRef.current = null;
    }
    setTimeout(() => {
      if (!window.TradingView) return;
      try {
        widgetRef.current = new window.TradingView.widget({
          autosize: true,
          symbol: market.symbol,
          interval: "1",
          timezone: "Etc/UTC",
          theme: "dark",
          style: "1",
          locale: "en",
          toolbar_bg: "#0a0f1a",
          enable_publishing: false,
          hide_side_toolbar: true,
          allow_symbol_change: false,
          container_id: chartContainerId,
          hide_top_toolbar: false,
          save_image: false,
        });
      } catch {}
    }, 100);
  }, []);

  const placeOrder = (direction: "UP" | "DOWN") => {
    const finalAmount = customAmount ? Number(customAmount) : amount;
    if (!finalAmount || finalAmount <= 0 || finalAmount > balance) return;

    const orderId = Date.now();
    const newOrder: Order = {
      id: orderId,
      market: selectedMarket.label,
      direction,
      amount: finalAmount,
      durationSeconds: duration.seconds,
      timeLeft: duration.seconds,
      entryTime: new Date(),
    };

    setBalance((b) => b - finalAmount);
    setActiveOrders((prev) => [...prev, newOrder]);
    setTotalTrades((t) => t + 1);

    const tick = setInterval(() => {
      setActiveOrders((prev) =>
        prev.map((o) =>
          o.id === orderId ? { ...o, timeLeft: Math.max(0, o.timeLeft - 1) } : o
        )
      );
    }, 1000);

    setTimeout(() => {
      clearInterval(tick);
      const won = Math.random() < 0.62;
      const payout = won ? parseFloat((finalAmount * 1.85).toFixed(2)) : 0;
      const profit = won ? parseFloat((payout - finalAmount).toFixed(2)) : -finalAmount;

      setActiveOrders((prev) => prev.filter((o) => o.id !== orderId));
      setHistory((prev) => [
        {
          id: orderId,
          market: selectedMarket.label,
          direction,
          amount: finalAmount,
          won,
          payout,
          profit,
        },
        ...prev.slice(0, 9),
      ]);
      if (won) {
        setBalance((b) => b + payout);
        setPulse("win");
      } else {
        setPulse("lose");
      }
      setTimeout(() => setPulse(null), 1500);
    }, duration.seconds * 1000);
  };

  useEffect(() => {
    if (totalTrades >= 3) {
      setTimeout(() => setShowSignupCTA(true), 500);
    }
  }, [totalTrades]);

  const resetDemo = () => {
    setBalance(10000);
    setActiveOrders([]);
    setHistory([]);
    setTotalTrades(0);
    setShowSignupCTA(false);
  };

  const effectiveAmount = customAmount ? Number(customAmount) : amount;
  const potentialPayout = parseFloat((effectiveAmount * 1.85).toFixed(2));

  return (
    <div className="min-h-screen bg-[#0a0f1a] text-white flex flex-col">
      <Script
        src="https://s3.tradingview.com/tv.js"
        strategy="afterInteractive"
        onLoad={initChart}
      />

      {/* Demo banner */}
      <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-600 text-white text-center py-2.5 px-4 text-sm font-medium flex items-center justify-center gap-3 flex-wrap">
        <span className="flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 shrink-0" />
          DEMO MODE — Virtual $10,000 balance. Real prices, no real money.
        </span>
        <Link href="/register">
          <span className="underline underline-offset-2 font-bold hover:no-underline cursor-pointer">
            Sign up free to trade for real →
          </span>
        </Link>
      </div>

      <div className="flex flex-col lg:flex-row flex-1 min-h-0">
        {/* Chart */}
        <div className="flex-1 flex flex-col min-h-[400px] lg:min-h-0">
          {/* Market selector */}
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/10 bg-[#0d1421] overflow-x-auto scrollbar-hide">
            {MARKETS.map((m) => (
              <button
                key={m.label}
                onClick={() => {
                  setSelectedMarket(m);
                  switchChart(m);
                  setMarketOpen(false);
                }}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all",
                  selectedMarket.label === m.label
                    ? "bg-amber-500 text-black"
                    : "bg-white/5 text-muted-foreground hover:bg-white/10"
                )}
              >
                {m.label}
              </button>
            ))}
          </div>

          <div className="flex-1 relative">
            <div id={chartContainerId} className="absolute inset-0" />
            {!chartReady && (
              <div className="absolute inset-0 flex items-center justify-center bg-[#0a0f1a]">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm text-muted-foreground">Loading live chart…</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Order panel */}
        <div className="w-full lg:w-80 shrink-0 border-l border-white/10 bg-[#0d1421] flex flex-col">
          {/* Balance */}
          <div
            className={cn(
              "p-4 border-b border-white/10 transition-all duration-300",
              pulse === "win" && "bg-emerald-500/10",
              pulse === "lose" && "bg-red-500/10"
            )}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Wallet className="w-3.5 h-3.5" /> Demo Balance
              </span>
              <button onClick={resetDemo} className="text-xs text-muted-foreground hover:text-white flex items-center gap-1">
                <RefreshCw className="w-3 h-3" /> Reset
              </button>
            </div>
            <div className="text-2xl font-bold font-mono">${formatBalance(balance)}</div>
            <div className={cn("text-xs font-medium mt-0.5", totalPnL >= 0 ? "text-emerald-400" : "text-red-400")}>
              {totalPnL >= 0 ? "+" : ""}${formatBalance(totalPnL)} P&L
            </div>
          </div>

          {/* Order form */}
          <div className="p-4 border-b border-white/10 space-y-4">
            {/* Amount */}
            <div>
              <label className="text-xs text-muted-foreground mb-2 block">Trade Amount (USDT)</label>
              <div className="grid grid-cols-3 gap-1.5 mb-2">
                {AMOUNTS.map((a) => (
                  <button
                    key={a}
                    onClick={() => { setAmount(a); setCustomAmount(""); }}
                    className={cn(
                      "py-1.5 rounded-lg text-xs font-semibold transition-all",
                      amount === a && !customAmount
                        ? "bg-amber-500 text-black"
                        : "bg-white/5 text-muted-foreground hover:bg-white/10"
                    )}
                  >
                    ${a}
                  </button>
                ))}
              </div>
              <input
                type="number"
                placeholder="Custom amount…"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:border-amber-500/50"
              />
            </div>

            {/* Duration */}
            <div>
              <label className="text-xs text-muted-foreground mb-2 block">Duration</label>
              <div className="flex gap-2">
                {DURATIONS.map((d) => (
                  <button
                    key={d.label}
                    onClick={() => setDuration(d)}
                    className={cn(
                      "flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all",
                      duration.label === d.label
                        ? "bg-amber-500 text-black"
                        : "bg-white/5 text-muted-foreground hover:bg-white/10"
                    )}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Payout preview */}
            <div className="bg-white/5 rounded-lg p-3 text-xs space-y-1">
              <div className="flex justify-between text-muted-foreground">
                <span>Entry</span><span className="font-mono">${formatBalance(effectiveAmount)}</span>
              </div>
              <div className="flex justify-between text-emerald-400">
                <span>Potential payout (85%)</span><span className="font-mono font-bold">${formatBalance(potentialPayout)}</span>
              </div>
            </div>

            {/* UP / DOWN buttons */}
            <div className="grid grid-cols-2 gap-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => placeOrder("UP")}
                disabled={effectiveAmount > balance || !effectiveAmount}
                className="py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-sm flex items-center justify-center gap-2 transition-colors"
              >
                <ArrowUpRight className="w-4 h-4" /> UP
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => placeOrder("DOWN")}
                disabled={effectiveAmount > balance || !effectiveAmount}
                className="py-3.5 rounded-xl bg-red-500 hover:bg-red-400 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-sm flex items-center justify-center gap-2 transition-colors"
              >
                <ArrowDownRight className="w-4 h-4" /> DOWN
              </motion.button>
            </div>
          </div>

          {/* Active orders */}
          {activeOrders.length > 0 && (
            <div className="p-4 border-b border-white/10">
              <p className="text-xs text-muted-foreground mb-2 font-medium">ACTIVE ORDERS</p>
              <div className="space-y-2">
                {activeOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between bg-white/5 rounded-lg px-3 py-2">
                    <div className="flex items-center gap-2">
                      <span className={cn("text-xs font-bold", order.direction === "UP" ? "text-emerald-400" : "text-red-400")}>
                        {order.direction === "UP" ? "▲" : "▼"} {order.market}
                      </span>
                      <span className="text-xs text-muted-foreground">${order.amount}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-amber-400 font-mono font-bold">
                      <Clock className="w-3 h-3" />
                      {formatCountdown(order.timeLeft)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Trade history */}
          {history.length > 0 && (
            <div className="flex-1 overflow-y-auto p-4">
              <p className="text-xs text-muted-foreground mb-2 font-medium">RECENT TRADES</p>
              <div className="space-y-1.5">
                {history.map((entry) => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center justify-between rounded-lg px-3 py-2 bg-white/5"
                  >
                    <div className="flex items-center gap-2">
                      {entry.won
                        ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        : <XCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />}
                      <div>
                        <div className="text-xs font-semibold">
                          {entry.direction === "UP" ? "▲" : "▼"} {entry.market}
                        </div>
                        <div className="text-[10px] text-muted-foreground">${entry.amount} entry</div>
                      </div>
                    </div>
                    <div className={cn("text-xs font-bold font-mono", entry.profit > 0 ? "text-emerald-400" : "text-red-400")}>
                      {entry.profit > 0 ? "+" : ""}{formatBalance(entry.profit)}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Signup CTA overlay - appears after 3 trades */}
      <AnimatePresence>
        {showSignupCTA && (
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 60 }}
            className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-gradient-to-t from-black/95 to-transparent"
          >
            <div className="max-w-lg mx-auto bg-gradient-to-r from-amber-600/20 to-orange-600/20 border border-amber-500/40 rounded-2xl p-5 backdrop-blur-xl shadow-2xl">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center shrink-0">
                  <Trophy className="w-5 h-5 text-black" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-base mb-1">
                    {totalPnL >= 0 ? `You're up $${formatBalance(totalPnL)} in demo!` : "Keep practicing!"}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Create a free account to trade with real money, make real withdrawals, and access all 24 markets.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Link href="/register" className="flex-1">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full h-10 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl text-sm flex items-center justify-center gap-2 transition-colors"
                      >
                        Create Free Account <ArrowRight className="w-4 h-4" />
                      </motion.button>
                    </Link>
                    <button
                      onClick={() => setShowSignupCTA(false)}
                      className="h-10 px-4 bg-white/5 hover:bg-white/10 rounded-xl text-sm text-muted-foreground transition-colors"
                    >
                      Keep demoing
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom trust bar */}
      <div className="border-t border-white/10 bg-[#0d1421] py-3 px-4">
        <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground">
          {[
            { icon: Shield, label: "SSL Secured" },
            { icon: Zap, label: "Real Binance Prices" },
            { icon: Users, label: "50,000+ Traders" },
            { icon: CheckCircle, label: "Free to Start" },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-1.5">
              <Icon className="w-3.5 h-3.5 text-amber-500" />
              {label}
            </div>
          ))}
          <Link href="/register">
            <span className="text-amber-400 font-semibold hover:text-amber-300 transition-colors cursor-pointer">
              Sign up free →
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
