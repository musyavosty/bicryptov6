"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Mail, ArrowRight, CheckCircle, Sparkles } from "lucide-react";

export function NewsletterCapture() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || status !== "idle") return;
    setStatus("loading");
    // Simulate submission — in production this would call the backend
    await new Promise((r) => setTimeout(r, 900));
    setStatus("done");
  };

  return (
    <div className="relative rounded-3xl border border-amber-500/20 bg-gradient-to-br from-amber-500/5 via-orange-500/5 to-amber-500/5 overflow-hidden p-8 md:p-10 text-center">
      {/* Background glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-600/10 via-transparent to-orange-600/10 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
        className="relative z-10"
      >
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center mx-auto mb-5">
          <Mail className="w-6 h-6 text-white" />
        </div>

        <h3 className="text-2xl md:text-3xl font-bold mb-2">
          Stay ahead of the{" "}
          <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
            market
          </span>
        </h3>
        <p className="text-muted-foreground mb-7 max-w-md mx-auto text-sm md:text-base">
          Get weekly market insights, exclusive trading signals, and VIP pool alerts delivered to your inbox.
        </p>

        {status === "done" ? (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-semibold"
          >
            <CheckCircle className="w-5 h-5" />
            You&apos;re on the list! Check your inbox.
          </motion.div>
        ) : (
          <form onSubmit={submit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              required
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 h-12 px-4 rounded-xl bg-white/10 border border-white/20 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-amber-500/50 focus:bg-white/15 transition-colors text-sm"
            />
            <motion.button
              type="submit"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              disabled={status === "loading"}
              className="h-12 px-6 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-sm flex items-center gap-2 justify-center hover:from-amber-400 hover:to-orange-400 transition-all disabled:opacity-60 flex-shrink-0"
            >
              {status === "loading" ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Subscribe <ArrowRight className="w-4 h-4" />
                </>
              )}
            </motion.button>
          </form>
        )}

        <p className="text-xs text-muted-foreground/60 mt-4">
          No spam, ever. Unsubscribe in one click.
        </p>
      </motion.div>
    </div>
  );
}
