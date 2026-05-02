"use client";

import React from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, ArrowRight, TrendingUp, BookOpen } from "lucide-react";
import { Link } from "@/i18n/routing";

const POSTS = [
  {
    tag: "Market Analysis",
    tagColor: "text-amber-400 bg-amber-400/10",
    title: "Bitcoin Breaks $100K: What This Means for African Crypto Traders",
    excerpt: "BTC's historic milestone opens new opportunities for African investors. Here's how to position your portfolio for the next leg up — and which altcoins historically follow Bitcoin's leads.",
    readTime: "5 min read",
    date: "Apr 28, 2025",
    author: "Kwame A.",
    authorRole: "Head of Trading",
    emoji: "₿",
    href: "/blog",
  },
  {
    tag: "Platform Update",
    tagColor: "text-emerald-400 bg-emerald-400/10",
    title: "DeMourinho Crypto Launches 120% APR VIP Staking Pool — Limited Spots",
    excerpt: "We've launched our most aggressive staking product to date. The DM VIP Premium Pool offers 120% APR with daily payouts, available exclusively to verified members. Here's everything you need to know.",
    readTime: "3 min read",
    date: "Apr 25, 2025",
    author: "Fatima B.",
    authorRole: "Product Manager",
    emoji: "🏆",
    href: "/staking",
  },
  {
    tag: "Education",
    tagColor: "text-blue-400 bg-blue-400/10",
    title: "Binary Options 101: How to Earn Up to 95% Profit in Under 5 Minutes",
    excerpt: "Binary options are the fastest way to profit from crypto price movements. We break down exactly how they work, what payout rates mean, and how to minimize risk using our practice mode.",
    readTime: "7 min read",
    date: "Apr 20, 2025",
    author: "Chidi O.",
    authorRole: "Senior Trader",
    emoji: "📊",
    href: "/binary",
  },
];

export function BlogPreview() {
  return (
    <section className="relative py-20 overflow-hidden">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-12"
        >
          <div>
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 text-amber-400 mb-3">
              <BookOpen className="w-3.5 h-3.5" />
              Insights & Updates
            </span>
            <h2 className="text-2xl md:text-3xl font-bold">
              From the{" "}
              <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                trading desk
              </span>
            </h2>
          </div>
          <Link href="/blog">
            <motion.span
              whileHover={{ x: 3 }}
              className="inline-flex items-center gap-2 text-sm font-semibold text-amber-400 hover:text-amber-300 transition-colors cursor-pointer"
            >
              All articles <ArrowRight className="w-4 h-4" />
            </motion.span>
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {POSTS.map((post, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              viewport={{ once: true }}
            >
              <Link href={post.href}>
                <div className="group h-full rounded-2xl border border-white/10 bg-white/5 hover:bg-white/8 hover:border-amber-500/20 transition-all overflow-hidden cursor-pointer">
                  {/* Card header */}
                  <div className="p-6 border-b border-white/[0.06] flex items-center justify-between">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${post.tagColor}`}>
                      {post.tag}
                    </span>
                    <span className="text-2xl">{post.emoji}</span>
                  </div>

                  {/* Content */}
                  <div className="p-6 flex flex-col h-full">
                    <h3 className="font-bold text-base leading-snug mb-3 group-hover:text-amber-300 transition-colors line-clamp-3">
                      {post.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-5 line-clamp-3">
                      {post.excerpt}
                    </p>

                    <div className="mt-auto flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" />
                          {post.date}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          {post.readTime}
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-amber-400 group-hover:translate-x-1 transition-transform" />
                    </div>

                    <div className="mt-4 pt-4 border-t border-white/[0.06] flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-xs font-bold text-white">
                        {post.author[0]}
                      </div>
                      <div>
                        <div className="text-xs font-semibold">{post.author}</div>
                        <div className="text-[10px] text-muted-foreground">{post.authorRole}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
