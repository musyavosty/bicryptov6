#!/usr/bin/env node
"use strict";

const mysql = require("mysql2/promise");

const DB_URL = process.env.MYSQL_URL || process.env.DB_URL ||
  "mysql://root:AGUBpJBufvpZzyHxtXgTmZJTJzKgJZaD@zephyr.proxy.rlwy.net:52822/railway";

function parseUrl(url) {
  const m = url.match(/mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
  if (!m) throw new Error("Bad DATABASE_URL: " + url);
  return { user: m[1], password: m[2], host: m[3], port: +m[4], database: m[5] };
}

async function run() {
  const cfg = parseUrl(DB_URL);
  const conn = await mysql.createConnection({ ...cfg, connectTimeout: 20000 });
  let ok = 0, err = 0;

  const q = async (label, sql, params = []) => {
    try {
      const [r] = params.length ? await conn.execute(sql, params) : await conn.query(sql);
      const n = Array.isArray(r) ? r.length : (r.affectedRows || r.changedRows || 0);
      console.log(`  ✓ ${label}${n ? " (" + n + " rows)" : ""}`);
      ok++;
    } catch (e) {
      console.log(`  ✗ ${label}: ${e.message.slice(0, 100)}`);
      err++;
    }
  };

  console.log("\n=== DeMourinho Crypto — Full Activation Script ===\n");

  // ── 1. Extensions ──────────────────────────────────────────────────────────
  console.log("[1] Extensions");
  await q("enable all extensions",
    `UPDATE extension SET status = 1 WHERE name IN (
      'p2p','staking','ico','futures','copy_trading','gateway',
      'ai_market_maker','trading_bot','nft','mailwizard','forex',
      'ai_investment','ecommerce','knowledge_base','mlm',
      'binary_ai_engine','wallet_connect','ecosystem'
    )`);

  // ── 2. Settings ────────────────────────────────────────────────────────────
  console.log("[2] Settings");
  const settings = {
    investment: "true",
    stakingStatus: "true",
    p2pStatus: "true",
    forexStatus: "true",
    icoStatus: "true",
    nftStatus: "true",
    ecommerceStatus: "true",
    walletStatus: "true",
    copyTradingStatus: "true",
    tradingBotStatus: "true",
    mlmStatus: "true",
    kycStatus: "true",
    aiInvestmentStatus: "true",
    aiMarketMakerStatus: "true",
    binaryAiStatus: "true",
    walletConnectStatus: "true",
    ecosystemStatus: "true",
    mailwizardStatus: "true",
    gatewayStatus: "true",
    fiatWallets: "true",
    spotWallets: "true",
    binaryStatus: "true",
    binaryPracticeStatus: "true",
    p2pMaximumTradeAmount: "500000",
    p2pMinimumTradeAmount: "1",
    withdrawApproval: "false",
    kycRequiredForWithdraw: "false",
    kycRequiredForTrade: "false",
    verifyEmailStatus: "false",
    depositExpiration: "60",
    siteCurrency: "USD",
    siteMaintenanceMode: "false",
    autoApproveAuthors: "true",
    moderateComments: "false",
    twoFactorStatus: "true",
    twoFactorAppStatus: "true",
    referralApprovalRequired: "false",
    p2pAutoApproveOffers: "true",
    withdrawChainFee: "true",
    stakingAutomaticEarningsDistribution: "true",
    stakingCompoundFrequency: "DAILY",
    stakingDefaultAprCalculationMethod: "FLAT",
    icoMinInvestmentAmount: "10",
    spotWithdrawFee: "0.1",
    walletTransferFeePercentage: "0.1",
  };

  for (const [k, v] of Object.entries(settings)) {
    await q(`setting: ${k}`,
      "INSERT INTO settings (`key`, value) VALUES (?, ?) ON DUPLICATE KEY UPDATE value = VALUES(value)",
      [k, v]);
  }

  // ── 3. Activate all existing exchange markets ──────────────────────────────
  console.log("[3] Exchange Markets");
  await q("activate all existing markets", "UPDATE exchange_market SET status = 1");

  // New spot pairs — 60+ popular coins
  const spotPairs = [
    ["BTC","USDT",1,1],["SHIB","USDT",1,1],["PEPE","USDT",1,1],["WIF","USDT",1,1],
    ["TON","USDT",1,1],["SUI","USDT",1,1],["APT","USDT",1,0],["INJ","USDT",1,0],
    ["TIA","USDT",1,0],["SEI","USDT",0,0],["FLOKI","USDT",1,0],["BONK","USDT",1,0],
    ["NOT","USDT",0,0],["JUP","USDT",0,0],["STX","USDT",0,0],["IMX","USDT",0,0],
    ["GRT","USDT",0,0],["LDO","USDT",1,0],["RNDR","USDT",1,0],["FET","USDT",1,0],
    ["WLD","USDT",1,0],["DYDX","USDT",0,0],["GMX","USDT",0,0],["ORDI","USDT",1,0],
    ["AAVE","USDT",1,0],["MKR","USDT",1,0],["COMP","USDT",0,0],["CRV","USDT",0,0],
    ["SNX","USDT",0,0],["SUSHI","USDT",0,0],["YFI","USDT",0,0],["BAL","USDT",0,0],
    ["1INCH","USDT",0,0],["UMA","USDT",0,0],["OCEAN","USDT",0,0],["AGIX","USDT",0,0],
    ["ZEC","USDT",0,0],["XMR","USDT",0,0],["DASH","USDT",0,0],["ETC","USDT",0,0],
    ["XLM","USDT",0,0],["ALGO","USDT",0,0],["VET","USDT",0,0],["THETA","USDT",0,0],
    ["FTM","USDT",1,0],["HBAR","USDT",0,0],["ICP","USDT",0,0],["FLOW","USDT",0,0],
    ["MINA","USDT",0,0],["ONE","USDT",0,0],["CHZ","USDT",1,0],["ENJ","USDT",0,0],
    ["BAT","USDT",0,0],["SAND","USDT",1,0],["MANA","USDT",1,0],["AXS","USDT",1,0],
    ["GALA","USDT",1,0],["APE","USDT",0,0],["BLUR","USDT",0,0],["PYTH","USDT",0,0],
    ["CFX","USDT",0,0],["CELO","USDT",0,0],["ROSE","USDT",0,0],["ZIL","USDT",0,0],
    ["JASMY","USDT",0,0],["TURBO","USDT",0,0],
  ];
  for (const [currency, pair, isTrending, isHot] of spotPairs) {
    await q(`spot ${currency}/${pair}`,
      "INSERT IGNORE INTO exchange_market (currency, pair, status, isTrending, isHot) VALUES (?, ?, 1, ?, ?)",
      [currency, pair, isTrending, isHot]);
  }

  // ── 4. Binary markets ─────────────────────────────────────────────────────
  console.log("[4] Binary Markets");
  await q("activate all existing binary markets", "UPDATE binary_market SET status = 1");
  const binaryPairs = [
    ["AVAX","USDT",1,0],["LINK","USDT",0,0],["LTC","USDT",0,0],["BCH","USDT",0,0],
    ["DOT","USDT",0,0],["ATOM","USDT",0,0],["TRX","USDT",0,0],["NEAR","USDT",0,0],
    ["UNI","USDT",0,0],["TON","USDT",1,1],["SUI","USDT",1,1],["APT","USDT",1,0],
    ["INJ","USDT",1,0],["PEPE","USDT",1,1],["WIF","USDT",1,1],["ARB","USDT",0,0],
    ["OP","USDT",0,0],["FTM","USDT",0,0],["SHIB","USDT",1,0],["FLOKI","USDT",0,0],
    ["FIL","USDT",0,0],["LDO","USDT",0,0],["RNDR","USDT",0,0],["FET","USDT",0,0],
    ["WLD","USDT",1,0],["ETC","USDT",0,0],["XLM","USDT",0,0],["ALGO","USDT",0,0],
  ];
  for (const [currency, pair, isTrending, isHot] of binaryPairs) {
    await q(`binary ${currency}/${pair}`,
      "INSERT IGNORE INTO binary_market (currency, pair, status, minAmount, maxAmount, isTrending, isHot) VALUES (?, ?, 1, 1.00, 10000.00, ?, ?)",
      [currency, pair, isTrending, isHot]);
  }

  // ── 5. Futures markets ────────────────────────────────────────────────────
  console.log("[5] Futures Markets");
  await q("activate all existing futures", "UPDATE futures_market SET status = 1");
  const futuresPairs = [
    ["LINK","USDT",0,0],["DOT","USDT",0,0],["ATOM","USDT",0,0],["ADA","USDT",0,0],
    ["LTC","USDT",0,0],["BCH","USDT",0,0],["TRX","USDT",0,0],["UNI","USDT",0,0],
    ["ARB","USDT",1,0],["OP","USDT",0,0],["TON","USDT",1,1],["SUI","USDT",1,1],
    ["APT","USDT",1,0],["INJ","USDT",1,0],["SEI","USDT",0,0],["PEPE","USDT",1,1],
    ["WIF","USDT",1,1],["FTM","USDT",0,0],["NEAR","USDT",0,0],["SHIB","USDT",1,0],
    ["FIL","USDT",0,0],["LDO","USDT",0,0],["IMX","USDT",0,0],["STX","USDT",0,0],
    ["HBAR","USDT",0,0],["ICP","USDT",0,0],["FET","USDT",1,0],["WLD","USDT",1,0],
    ["ETC","USDT",0,0],["RNDR","USDT",0,0],["TIA","USDT",1,0],["ORDI","USDT",1,0],
  ];
  for (const [currency, pair, isTrending, isHot] of futuresPairs) {
    await q(`futures ${currency}/${pair}`,
      "INSERT IGNORE INTO futures_market (currency, pair, status, isTrending, isHot) VALUES (?, ?, 1, ?, ?)",
      [currency, pair, isTrending, isHot]);
  }

  // ── 6. Binary durations — add faster and longer options ───────────────────
  console.log("[6] Binary Durations");
  const durations = [
    [30, 85],   // 30 seconds
    [2, 82],    // 2 minutes
    [10, 74],   // 10 minutes
    [20, 71],   // 20 minutes
    [45, 68],   // 45 minutes
    [120, 65],  // 2 hours
    [480, 63],  // 8 hours
    [1440, 60], // 24 hours
  ];
  for (const [duration, profit] of durations) {
    await q(`duration ${duration}min`,
      "INSERT IGNORE INTO binary_duration (id, duration, profitPercentage, status) VALUES (UUID(), ?, ?, 1)",
      [duration, profit]);
  }

  // ── 7. Currencies — enable major world currencies ─────────────────────────
  console.log("[7] Currencies");
  const majorCurrencies = [
    "USD","EUR","GBP","JPY","AUD","CAD","CHF","CNY","HKD","SGD",
    "NZD","NOK","SEK","DKK","INR","BRL","MXN","ZAR","AED","SAR",
    "KRW","TRY","PLN","THB","MYR","IDR","PHP","TWD","VND","UAH",
    "CZK","HUF","RON","ILS","QAR","KWD","OMR","BHD","JOD","EGP",
    "MAD","NGN","KES","GHS","TND","DZD","LKR","PKR","BDT","CLP",
    "COP","PEN","ARS","RUB","GEL","KZT","MNT","ETB","TZS","RWF"
  ];
  await q(`enable ${majorCurrencies.length} major currencies`,
    `UPDATE currency SET status = 1 WHERE id IN (${majorCurrencies.map(()=>"?").join(",")})`,
    majorCurrencies);

  // ── 8. Ecosystem blockchains — enable all ─────────────────────────────────
  console.log("[8] Ecosystem Blockchains");
  await q("enable all ecosystem blockchains", "UPDATE ecosystem_blockchain SET status = 1");

  // ── 9. Investment plans — add more tiers ──────────────────────────────────
  console.log("[9] Investment Plans");
  await q("activate all existing plans", "UPDATE investment_plan SET status = 1");
  const newPlans = [
    ["Starter","Starter Plan","Perfect for first-time investors starting small.","USD",50,500,6,5,7,6,"WIN",0,"FIAT"],
    ["Platinum","Platinum Plan","Premium returns for high-volume investors.","USD",25000,250000,32,28,36,32,"WIN",1,"FIAT"],
    ["Diamond","Diamond Elite","Institutional-grade returns and priority support.","USD",100000,1000000,42,38,46,42,"WIN",1,"FIAT"],
    ["Crypto Bronze","Crypto Starter","Crypto-denominated entry-level plan.","USDT",100,1000,7,6,8,7,"WIN",0,"SPOT"],
    ["Crypto Silver","Crypto Mid-Tier","Solid returns on mid-level crypto investments.","USDT",1000,10000,14,12,16,14,"WIN",0,"SPOT"],
    ["Crypto Gold","Crypto Premium","High-yield crypto investment strategy.","USDT",10000,100000,25,22,28,25,"WIN",1,"SPOT"],
    ["Crypto Platinum","Crypto Elite","Maximum crypto investment returns.","USDT",50000,500000,38,35,42,38,"WIN",1,"SPOT"],
  ];
  for (const [name,title,desc,currency,min,max,profit,minP,maxP,defP,defR,trending,walletType] of newPlans) {
    await q(`plan: ${name}`,
      `INSERT IGNORE INTO investment_plan (id, name, title, description, currency, minAmount, maxAmount, status, profitPercentage, minProfit, maxProfit, defaultProfit, defaultResult, trending, walletType)
       VALUES (UUID(), ?, ?, ?, ?, ?, ?, 1, ?, ?, ?, ?, ?, ?, ?)`,
      [name, title, desc, currency, min, max, profit, minP, maxP, defP, defR, trending, walletType]);
  }

  // ── 10. Investment durations ───────────────────────────────────────────────
  console.log("[10] Investment Durations");
  const [existingDurations] = await conn.query("SELECT duration FROM investment_duration");
  const existDurSet = new Set(existingDurations.map(r => r.duration));
  const newDurations = [
    [7,"WEEK"],[14,"WEEK"],[21,"WEEK"],[45,"DAY"],[60,"DAY"],[90,"DAY"],
    [180,"DAY"],[365,"DAY"]
  ];
  for (const [dur, timeframe] of newDurations) {
    if (!existDurSet.has(dur)) {
      await q(`duration ${dur} ${timeframe}`,
        "INSERT INTO investment_duration (id, duration, timeframe) VALUES (UUID(), ?, ?)",
        [dur, timeframe]);
    }
  }

  // Link all plans to all durations
  await q("link plans to durations",
    `INSERT IGNORE INTO investment_plan_duration (id, planId, durationId)
     SELECT UUID(), ip.id, id_d.id FROM investment_plan ip
     CROSS JOIN investment_duration id_d
     WHERE NOT EXISTS (
       SELECT 1 FROM investment_plan_duration ipd
       WHERE ipd.planId = ip.id AND ipd.durationId = id_d.id
     )`);

  // ── 11. Staking pools — add more options ──────────────────────────────────
  console.log("[11] Staking Pools");
  await q("activate all existing pools", "UPDATE staking_pools SET status = 'ACTIVE'");
  const newPools = [
    ["USDC Stable Yield","USD Coin","USDC","Stable coin staking with consistent returns.",10,0,100,1000000,0,5,0,"DAILY",0,"PLATFORM","SPOT"],
    ["BNB Smart Staking","BNB","BNB","Stake BNB for daily auto-distributed rewards.",12,14,0.1,10000,2.5,5,1,"DAILY",0,"PLATFORM","SPOT"],
    ["XRP Flexible","XRP","XRP","Flexible XRP staking. Withdraw anytime.",6,0,100,500000,0,5,0,"DAILY",0,"PLATFORM","SPOT"],
    ["ADA 60-Day","Cardano","ADA","Locked ADA staking with compounding interest.",18,60,1000,1000000,3,5,1,"DAILY",1,"PLATFORM","SPOT"],
    ["DOT Polkadot","Polkadot","DOT","Polkadot parachain staking rewards.",14,28,10,100000,2,5,0,"DAILY",0,"PLATFORM","SPOT"],
    ["SOL Auto-Compound","Solana","SOL","SOL staking with daily auto-compounding.",20,90,1,50000,5,5,1,"DAILY",1,"PLATFORM","SPOT"],
    ["AVAX Avalanche","Avalanche","AVAX","Avalanche validator rewards distributed daily.",16,30,25,25000,2,5,0,"DAILY",0,"PLATFORM","SPOT"],
    ["MATIC Polygon","Polygon","MATIC","Polygon PoS staking for passive income.",11,0,100,5000000,0,5,0,"DAILY",0,"PLATFORM","SPOT"],
    ["ATOM Cosmos","Cosmos","ATOM","Cosmos Hub staking rewards.",15,21,10,50000,2,5,0,"DAILY",0,"PLATFORM","SPOT"],
    ["LINK Chainlink","Chainlink","LINK","Chainlink oracle node staking.",9,0,10,100000,0,5,0,"DAILY",0,"PLATFORM","SPOT"],
  ];
  for (const [name,token,symbol,desc,apr,lock,min,max,earlyFee,adminFee,promoted,freq,autoComp,src,walletType] of newPools) {
    await q(`pool: ${name}`,
      `INSERT IGNORE INTO staking_pools (id, name, token, symbol, description, apr, lockPeriod, minStake, maxStake, earlyWithdrawalFee, adminFeePercentage, status, isPromoted, earningFrequency, autoCompound, profitSource, walletType)
       VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE', ?, ?, ?, ?, ?)`,
      [name, token, symbol, desc, apr, lock, min, max, earlyFee, adminFee, promoted, freq, autoComp, src, walletType]);
  }

  // ── 12. P2P Payment methods — add global options ──────────────────────────
  console.log("[12] P2P Payment Methods");
  const newP2P = [
    ["Skrill","skrill","Skrill digital wallet.","Instant","1%",7,1],
    ["Neteller","neteller","Neteller online payment.","Instant","1.9%",8,1],
    ["WebMoney","webmoney","WebMoney electronic wallet.","Instant","0.8%",9,1],
    ["Perfect Money","perfectmoney","Perfect Money wallet transfer.","Instant","0.5%",10,1],
    ["Zelle","zelle","US instant bank transfer via Zelle.","Instant","0%",11,0],
    ["Venmo","venmo","Venmo social payment (US).","Instant","0%",12,0],
    ["CashApp","cashapp","Cash App payment (US).","Instant","0%",13,0],
    ["Alipay","alipay","Alipay digital payment.","Instant","0%",14,0],
    ["WeChat Pay","wechatpay","WeChat Pay transfer.","Instant","0%",15,0],
    ["M-Pesa","mpesa","M-Pesa mobile money (Africa).","Instant","1%",16,0],
    ["Pix","pix","Brazil Pix instant payment.","Instant","0%",17,0],
    ["UPI","upi","India UPI instant payment.","Instant","0%",18,0],
    ["GCash","gcash","GCash mobile wallet (Philippines).","Instant","0%",19,0],
    ["Paytm","paytm","Paytm wallet (India).","Instant","0%",20,0],
    ["GrabPay","grabpay","GrabPay wallet (Southeast Asia).","Instant","0%",21,0],
    ["Bkash","bkash","bKash mobile banking (Bangladesh).","Instant","1%",22,0],
    ["OrangeMonkey","orangemoney","Orange Money mobile payment.","Instant","1%",23,0],
    ["Crypto (BTC)","bitcoin","On-chain BTC payment.","10-60 min","Network",24,1],
    ["Crypto (ETH)","ethereum","On-chain ETH payment.","5-30 min","Network",25,1],
    ["Crypto (BNB)","bnb","BNB/BSC on-chain payment.","1-5 min","Network",26,1],
  ];
  for (const [name, icon, desc, time, fees, rank, isGlobal] of newP2P) {
    await q(`p2p: ${name}`,
      `INSERT IGNORE INTO p2p_payment_methods (id, name, icon, description, processingTime, fees, available, popularityRank, isGlobal)
       SELECT UUID(), ?, ?, ?, ?, ?, 1, ?, ?
       WHERE NOT EXISTS (SELECT 1 FROM p2p_payment_methods WHERE name = ?)`,
      [name, icon, desc, time, fees, rank, isGlobal, name]);
  }

  // ── 13. Forex plans — seed if empty ───────────────────────────────────────
  console.log("[13] Forex Plans");
  const [fxCheck] = await conn.query("SELECT COUNT(*) as c FROM forex_plan");
  if (fxCheck[0].c === 0) {
    const fxPlans = [
      ["Micro Forex","Micro Forex Plan","Entry-level forex managed account.","USD",100,1000,5,4,6,5,"WIN",0,"FIAT"],
      ["Mini Forex","Mini Forex Plan","Mid-tier forex with steady returns.","USD",1000,10000,8,7,10,8,"WIN",0,"FIAT"],
      ["Standard Forex","Standard Forex Plan","Standard managed forex account.","USD",5000,50000,12,10,14,12,"WIN",1,"FIAT"],
      ["Pro Forex","Pro Forex Plan","Professional-grade forex portfolio.","USD",25000,250000,18,15,21,18,"WIN",1,"FIAT"],
      ["VIP Forex","VIP Forex Plan","VIP tier with dedicated account manager.","USD",100000,1000000,24,20,28,24,"WIN",1,"FIAT"],
    ];
    for (const [name,title,desc,cur,min,max,profit,minP,maxP,defP,defR,trending,walletType] of fxPlans) {
      await q(`forex: ${name}`,
        `INSERT INTO forex_plan (id, name, title, description, currency, minAmount, maxAmount, status, profitPercentage, minProfit, maxProfit, defaultProfit, defaultResult, trending, walletType)
         VALUES (UUID(), ?, ?, ?, ?, ?, ?, 1, ?, ?, ?, ?, ?, ?, ?)`,
        [name, title, desc, cur, min, max, profit, minP, maxP, defP, defR, trending, walletType]);
    }

    const fxDurations = [[7,"WEEK"],[14,"WEEK"],[30,"DAY"],[60,"DAY"],[90,"DAY"],[180,"DAY"]];
    for (const [dur, tf] of fxDurations) {
      await q(`forex duration ${dur}`,
        "INSERT INTO forex_duration (id, duration, timeframe) VALUES (UUID(), ?, ?)", [dur, tf]);
    }
  } else {
    console.log("  ℹ forex plans already seeded, skipping");
  }

  // ── 14. AI Investment plans — seed if empty ───────────────────────────────
  console.log("[14] AI Investment Plans");
  const [aiCheck] = await conn.query("SELECT COUNT(*) as c FROM ai_investment_plan");
  if (aiCheck[0].c === 0) {
    const aiPlans = [
      ["AI Starter","AI Starter","AI-driven entry-level investment.",100,1000,8,7,10,8,"WIN",0],
      ["AI Growth","AI Growth","AI portfolio with balanced risk.",1000,10000,14,12,16,14,"WIN",0],
      ["AI Pro","AI Pro","Advanced AI trading strategies.",5000,50000,22,18,26,22,"WIN",1],
      ["AI Elite","AI Elite","Maximum AI strategy returns.",25000,250000,35,30,40,35,"WIN",1],
    ];
    for (const [name,title,desc,min,max,profit,minP,maxP,defP,defR,trending] of aiPlans) {
      await q(`ai plan: ${name}`,
        `INSERT INTO ai_investment_plan (id, name, title, description, status, profitPercentage, minProfit, maxProfit, minAmount, maxAmount, trending, defaultProfit, defaultResult)
         VALUES (UUID(), ?, ?, ?, 1, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [name, title, desc, profit, minP, maxP, min, max, trending, defP, defR]);
    }
  } else {
    console.log("  ℹ ai investment plans already seeded, skipping");
  }

  // ── 15. KYC levels ────────────────────────────────────────────────────────
  console.log("[15] KYC Levels");
  const [kycCheck] = await conn.query("SELECT COUNT(*) as c FROM kyc_level");
  if (kycCheck[0].c === 0) {
    const kycLevels = [
      [1,"Basic","Email and phone verification. Standard trading limits.",
       '["email","phone"]',
       '{"deposit":{"fiat":2000,"crypto":10000},"withdraw":{"fiat":2000,"crypto":10000},"trading":{"spot":true,"binary":true,"futures":false}}'],
      [2,"Standard","Government ID verification for higher limits.",
       '["firstName","lastName","dateOfBirth","country","address","idNumber","idFront","idBack"]',
       '{"deposit":{"fiat":25000,"crypto":100000},"withdraw":{"fiat":25000,"crypto":100000},"trading":{"spot":true,"binary":true,"futures":true}}'],
      [3,"Advanced","Full KYC with selfie for maximum limits.",
       '["firstName","lastName","dateOfBirth","country","address","idNumber","idFront","idBack","selfie","proofOfAddress"]',
       '{"deposit":{"fiat":250000,"crypto":1000000},"withdraw":{"fiat":250000,"crypto":1000000},"trading":{"spot":true,"binary":true,"futures":true,"copyTrading":true}}'],
    ];
    for (const [level, name, desc, fields, features] of kycLevels) {
      await q(`kyc level ${level}`,
        "INSERT INTO kyc_level (id, name, description, level, fields, features, status) VALUES (UUID(), ?, ?, ?, ?, ?, 1)",
        [name, desc, level, fields, features]);
    }
  } else {
    console.log("  ℹ kyc levels already seeded, skipping");
  }

  // ── 16. Exchange currencies ───────────────────────────────────────────────
  console.log("[16] Exchange Currencies");
  await q("activate all exchange currencies", "UPDATE exchange_currency SET status = 1");
  // KuCoin does not carry ANY XXX/ETH pairs (e.g. LINK/ETH, SOL/ETH, XRP/ETH).
  // The processCurrenciesPrices CRON fails hard on the first missing symbol,
  // blocking ALL price updates every run. Deactivate every ETH-quoted
  // exchange_market row so the CRON only sees pairs KuCoin actually supports.
  // Note: exchange_currency has no 'pair' column — the deactivation is done
  // entirely on exchange_market below.
  await q("deactivate all ETH-quoted exchange_market rows (not on KuCoin)",
    "UPDATE exchange_market SET status = 0 WHERE pair = 'ETH'");

  // ── 17. Exchanges — KuCoin as primary (Binance is geo-blocked on Railway) ──
  // Binance returns HTTP 451 from Railway's IP range even for public/no-key
  // API calls. KuCoin has the same pairs, same ccxt interface, and no geo-block.
  // If you later configure a Binance proxy in the admin Settings → Exchanges tab,
  // flip this: UPDATE exchange SET status=0; UPDATE exchange SET status=1 WHERE name='binance'.
  console.log("[17] Exchanges");
  // Insert kucoin row if the seeder didn't run (idempotent via INSERT IGNORE)
  await q("ensure kucoin row exists",
    "INSERT IGNORE INTO exchange (id, name, title, description, type, status) VALUES (UUID(), 'kucoin', 'KuCoin', 'KuCoin exchange for spot trading with real-time market data, order execution, and balance management.', 'spot', 0)");
  // Deactivate all, then activate kucoin only
  await q("deactivate all exchanges", "UPDATE exchange SET status = 0");
  await q("set kucoin as primary", "UPDATE exchange SET status = 1 WHERE name = 'kucoin'");

  // ── Done ───────────────────────────────────────────────────────────────────
  await conn.end();
  console.log(`\n=== Done: ${ok} succeeded, ${err} failed ===\n`);
}

run().catch(e => { console.error("FATAL:", e.message); process.exit(1); });
