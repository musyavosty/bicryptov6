import type { Metadata } from "next";
import DemoTradingClient from "./client";

export const metadata: Metadata = {
  title: "Demo Trading — Try Crypto Trading for Free | DeMourinho Crypto",
  description:
    "Practice crypto trading with a free $10,000 demo balance. Real market prices, no risk. Trade BTC, ETH, BNB and more. Sign up when you're ready.",
  openGraph: {
    title: "Free Demo Trading — DeMourinho Crypto",
    description:
      "Practice trading with $10,000 virtual balance. Real live prices. No registration required.",
    type: "website",
  },
};

export default function DemoPage() {
  return <DemoTradingClient />;
}
