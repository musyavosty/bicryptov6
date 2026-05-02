import React from "react";
import { Lock } from "lucide-react";

export const metadata = {
  title: "Privacy Policy | DeMourinho Crypto",
  description: "DeMourinho Crypto Privacy Policy — how we collect, use, and protect your personal data.",
};

const SECTIONS = [
  {
    title: "1. Information We Collect",
    body: `We collect information you provide directly: name, email address, phone number (optional), and any identity documents submitted for optional KYC verification. We automatically collect device information, IP addresses, browser type, and usage data when you interact with our Platform. For financial transactions, we collect wallet addresses, transaction IDs, and amounts.`,
  },
  {
    title: "2. How We Use Your Information",
    body: `We use collected information to: create and manage your account; process transactions; provide customer support; send transactional and promotional communications (you may opt out); detect and prevent fraud; comply with legal obligations; and improve our Platform's features and performance.`,
  },
  {
    title: "3. Data Sharing",
    body: `We do not sell your personal data. We may share information with: service providers who assist in platform operations (hosting, email, analytics) under strict data processing agreements; regulatory authorities when required by law; and financial partners for payment processing. All third parties are contractually obligated to protect your data.`,
  },
  {
    title: "4. Data Security",
    body: `We protect your data using AES-256 encryption at rest and TLS 1.3 in transit. Account passwords are stored using bcrypt hashing — we never store plain-text passwords. Access to production databases is restricted to authorized personnel only. We conduct regular security audits and penetration testing.`,
  },
  {
    title: "5. Cookies",
    body: `We use essential cookies for platform functionality (session management, authentication). We use analytics cookies (opt-in) to understand how users interact with our Platform. You may disable non-essential cookies through your browser settings or our cookie preference center without affecting core functionality.`,
  },
  {
    title: "6. Your Rights",
    body: `You have the right to: access the personal data we hold about you; correct inaccurate data; request deletion of your data (subject to legal retention requirements); object to or restrict certain processing; and data portability. To exercise any of these rights, contact us at privacy@demourinhocrypto.com.`,
  },
  {
    title: "7. Data Retention",
    body: `We retain account data for as long as your account is active plus 5 years after closure for legal compliance. Transaction records are retained for 7 years as required by financial regulations. You may request earlier deletion of non-financial data.`,
  },
  {
    title: "8. Children's Privacy",
    body: `DeMourinho Crypto is not intended for users under 18 years of age. We do not knowingly collect personal information from minors. If you believe we have inadvertently collected such data, contact us immediately at privacy@demourinhocrypto.com.`,
  },
  {
    title: "9. International Transfers",
    body: `Your data may be processed in countries other than your own, including Nigeria, Kenya, and cloud infrastructure regions globally. We ensure appropriate safeguards are in place for all international data transfers in accordance with applicable data protection laws.`,
  },
  {
    title: "10. Changes to This Policy",
    body: `We may update this Privacy Policy periodically. We will notify registered users of material changes by email and by posting a notice on the Platform. Continued use after notification constitutes acceptance of the updated policy. Last updated: May 2025.`,
  },
];

export default function Privacy() {
  return (
    <div className="min-h-screen py-20 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mx-auto mb-5">
            <Lock className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-3">Privacy Policy</h1>
          <p className="text-muted-foreground">Effective Date: 1 May 2025 · Last Updated: May 2025</p>
        </div>

        <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-5 mb-8 text-sm text-muted-foreground">
          <strong className="text-foreground">Your privacy matters.</strong> DeMourinho Crypto collects only what is necessary, protects it with enterprise-grade encryption, and never sells your data to third parties.
        </div>

        <div className="space-y-8">
          {SECTIONS.map((s, i) => (
            <div key={i}>
              <h2 className="text-lg font-bold mb-3">{s.title}</h2>
              <p className="text-muted-foreground leading-relaxed text-sm">{s.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 text-center text-sm text-muted-foreground">
          Privacy questions?{" "}
          <a href="/contact" className="text-amber-400 hover:underline">Contact our privacy team</a> at privacy@demourinhocrypto.com
        </div>
      </div>
    </div>
  );
}
