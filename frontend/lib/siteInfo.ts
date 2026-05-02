const dev = process.env.NODE_ENV !== "production";
const frontendPort = process.env.NEXT_PUBLIC_FRONTEND_PORT || 3000;
const backendPort = process.env.NEXT_PUBLIC_BACKEND_PORT || 4000;

// Frontend URL (for client-side navigation)
export const frontendUrl = dev
  ? `http://localhost:${frontendPort}`
  : process.env.NEXT_PUBLIC_SITE_URL || "http://localhost";

// Backend API URL (for API calls)
export const siteUrl = dev
  ? `http://localhost:${backendPort}`
  : process.env.NEXT_PUBLIC_SITE_URL || "http://localhost";

export const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "DeMourinho Crypto";

export const siteDescription =
  process.env.NEXT_PUBLIC_SITE_DESCRIPTION ||
  "DeMourinho Crypto — Africa's premier digital asset exchange. Trade crypto, earn up to 120% APR staking, binary options up to 95% payout, copy trading, AI investments and more.";
