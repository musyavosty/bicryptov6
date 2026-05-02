"use client";

import React, { useState } from "react";
import { Mail, MessageSquare, MapPin, Clock, CheckCircle, ArrowRight, Send } from "lucide-react";
import { motion } from "framer-motion";

export default function Contact() {
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    await new Promise((r) => setTimeout(r, 1000));
    setStatus("done");
  };

  const CHANNELS = [
    { icon: MessageSquare, title: "Live Chat", desc: "Chat with our support team in real time", action: "Start Chat →", color: "from-green-500 to-emerald-500" },
    { icon: Mail, title: "Email Support", desc: "support@demourinhocrypto.com", action: "Send Email →", color: "from-amber-500 to-orange-500" },
    { icon: MessageSquare, title: "WhatsApp", desc: "+234 801 234 5678 (Nigeria)", action: "Chat on WhatsApp →", color: "from-green-600 to-green-500" },
  ];

  const HOURS = [
    { label: "Live Chat", time: "24/7, 365 days" },
    { label: "Email", time: "< 4 hours response" },
    { label: "WhatsApp", time: "Mon–Fri 8am–10pm WAT" },
  ];

  return (
    <div className="min-h-screen py-20 px-4">
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-14">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 text-amber-400 mb-5">
            <MessageSquare className="w-4 h-4" />
            We&apos;re here to help
          </span>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Contact{" "}
            <span className="bg-gradient-to-r from-amber-400 via-yellow-300 to-orange-400 bg-clip-text text-transparent">Support</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Our pan-African support team is ready to assist you. Average response time under 4 hours.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          {CHANNELS.map((ch, i) => {
            const Icon = ch.icon;
            return (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                className="rounded-2xl border border-white/10 bg-white/5 p-6 hover:bg-white/8 transition-colors cursor-pointer group">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${ch.color} flex items-center justify-center mb-4`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold mb-1">{ch.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">{ch.desc}</p>
                <span className="text-sm font-semibold text-amber-400 group-hover:text-amber-300 transition-colors">{ch.action}</span>
              </motion.div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="lg:col-span-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 md:p-8">
              <h2 className="font-bold text-xl mb-6">Send us a message</h2>
              {status === "done" ? (
                <div className="text-center py-12">
                  <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
                  <h3 className="font-bold text-xl mb-2">Message received!</h3>
                  <p className="text-muted-foreground">We&apos;ll reply to {form.email} within 4 hours.</p>
                </div>
              ) : (
                <form onSubmit={submit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground mb-2 block">Full Name</label>
                      <input required type="text" placeholder="Your name" value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="w-full h-11 px-4 rounded-xl bg-white/10 border border-white/20 focus:outline-none focus:border-amber-500/50 text-sm transition-colors" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground mb-2 block">Email</label>
                      <input required type="email" placeholder="your@email.com" value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className="w-full h-11 px-4 rounded-xl bg-white/10 border border-white/20 focus:outline-none focus:border-amber-500/50 text-sm transition-colors" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground mb-2 block">Subject</label>
                    <select value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}
                      className="w-full h-11 px-4 rounded-xl bg-white/10 border border-white/20 focus:outline-none focus:border-amber-500/50 text-sm transition-colors">
                      <option value="">Select a topic</option>
                      <option>Deposit / Withdrawal Issue</option>
                      <option>Account Verification</option>
                      <option>Trading Question</option>
                      <option>Staking / Investment</option>
                      <option>Copy Trading</option>
                      <option>Technical Issue</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground mb-2 block">Message</label>
                    <textarea required rows={5} placeholder="Describe your issue or question in detail..."
                      value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 focus:outline-none focus:border-amber-500/50 text-sm resize-none transition-colors" />
                  </div>
                  <motion.button type="submit" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    disabled={status === "loading"}
                    className="w-full h-12 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold flex items-center justify-center gap-2 hover:from-amber-400 hover:to-orange-400 transition-all disabled:opacity-60">
                    {status === "loading"
                      ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      : <><Send className="w-4 h-4" /> Send Message</>}
                  </motion.button>
                </form>
              )}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="lg:col-span-2 space-y-5">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <div className="flex items-center gap-3 mb-5"><Clock className="w-5 h-5 text-amber-400" /><h3 className="font-bold">Support Hours</h3></div>
              <div className="space-y-3">
                {HOURS.map((h, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{h.label}</span>
                    <span className="font-semibold text-emerald-400">{h.time}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <div className="flex items-center gap-3 mb-5"><MapPin className="w-5 h-5 text-amber-400" /><h3 className="font-bold">Regional Offices</h3></div>
              <div className="space-y-4 text-sm">
                {[
                  { city: "Lagos, Nigeria", addr: "Victoria Island Business District" },
                  { city: "Nairobi, Kenya", addr: "Westlands Innovation Hub" },
                  { city: "Accra, Ghana", addr: "Airport Residential Area" },
                ].map((o, i) => (
                  <div key={i}>
                    <div className="font-semibold">{o.city}</div>
                    <div className="text-muted-foreground">{o.addr}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5">
              <p className="text-sm text-muted-foreground mb-3">Most questions are answered in our FAQ before submitting a ticket.</p>
              <a href="/" className="inline-flex items-center gap-2 text-sm font-bold text-amber-400 hover:text-amber-300 transition-colors">
                Browse FAQ <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
