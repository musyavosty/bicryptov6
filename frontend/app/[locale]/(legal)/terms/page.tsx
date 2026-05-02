import React from "react";
import { Shield } from "lucide-react";

export const metadata = {
  title: "Terms of Service | DeMourinho Crypto",
  description: "Read the DeMourinho Crypto Terms of Service. By using our platform you agree to these terms.",
};

const SECTIONS = [
  {
    title: "1. Acceptance of Terms",
    body: `By registering for or using DeMourinho Crypto ("the Platform"), you agree to be bound by these Terms of Service. If you do not agree, you may not use the Platform. These terms apply to all visitors, users, and other parties who access or use the service.`,
  },
  {
    title: "2. Eligibility",
    body: `You must be at least 18 years of age to use DeMourinho Crypto. By using our Platform, you represent and warrant that you meet this requirement. You are responsible for ensuring compliance with local laws applicable to your jurisdiction regarding cryptocurrency trading and investing.`,
  },
  {
    title: "3. Account Registration",
    body: `You agree to provide accurate, current, and complete information when creating an account. You are responsible for maintaining the confidentiality of your login credentials and for all activities that occur under your account. Notify us immediately at support@demourinhocrypto.com of any unauthorized account use.`,
  },
  {
    title: "4. Trading & Investment Services",
    body: `DeMourinho Crypto offers cryptocurrency spot trading, binary options, staking pools, forex investment plans, AI investment plans, copy trading, and P2P trading services. All trading and investment activities carry risk. Past performance of any plan or trader does not guarantee future results. Only invest what you can afford to lose.`,
  },
  {
    title: "5. Fees",
    body: `Trading fees are disclosed on our fees page and deducted automatically from executed trades. Staking and investment plan fees are disclosed at the time of subscription. Withdrawal fees vary by currency and method and are shown during the withdrawal process. We reserve the right to update fee structures with 7 days advance notice.`,
  },
  {
    title: "6. Prohibited Activities",
    body: `You may not use DeMourinho Crypto for: money laundering or any illegal activity; manipulation of market prices; creation of multiple accounts to abuse promotions; unauthorized access to other users' accounts; automated scraping or bot abuse; or any activity that violates applicable law.`,
  },
  {
    title: "7. Risk Disclosure",
    body: `Cryptocurrency trading involves substantial risk. Binary options are high-risk instruments where you can lose your entire stake. Investment plan returns are projections and not guarantees. You acknowledge that you understand these risks and accept full responsibility for your trading decisions.`,
  },
  {
    title: "8. Intellectual Property",
    body: `All content on DeMourinho Crypto — including software, trademarks, logos, and text — is the property of DeMourinho Crypto Ltd. or its licensors. You may not copy, reproduce, or distribute any content without express written permission.`,
  },
  {
    title: "9. Termination",
    body: `We reserve the right to suspend or terminate your account at any time for violation of these Terms, suspected fraud, or for any reason at our sole discretion with reasonable notice. Upon termination, any outstanding balance will be returned to you minus applicable fees.`,
  },
  {
    title: "10. Governing Law",
    body: `These Terms are governed by the laws of Nigeria, without regard to conflict of law principles. Any disputes shall be resolved through binding arbitration in Lagos, Nigeria, under the rules of the Lagos Court of Arbitration.`,
  },
  {
    title: "11. Changes to Terms",
    body: `We may update these Terms at any time. We will notify registered users of material changes via email. Continued use of the Platform following notification constitutes acceptance of the revised Terms. Last updated: May 2025.`,
  },
];

export default function Terms() {
  return (
    <div className="min-h-screen py-20 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center mx-auto mb-5">
            <Shield className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-3">Terms of Service</h1>
          <p className="text-muted-foreground">Effective Date: 1 May 2025 · Last Updated: May 2025</p>
        </div>

        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5 mb-8 text-sm text-muted-foreground">
          <strong className="text-foreground">Summary:</strong> DeMourinho Crypto is a cryptocurrency trading platform. By using it, you agree to trade responsibly, comply with local laws, and accept that all investments carry risk. Read the full terms below.
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
          Questions about these terms?{" "}
          <a href="/contact" className="text-amber-400 hover:underline">Contact our legal team</a>.
        </div>
      </div>
    </div>
  );
}
