#!/usr/bin/env node
/**
 * scripts/github-api-push.js
 *
 * Pushes changed files to GitHub via the Git Data API — no git CLI needed.
 * Creates a single commit on the main branch, which triggers Railway auto-deploy.
 *
 * Usage:
 *   node scripts/github-api-push.js "commit message"
 *   node scripts/github-api-push.js "commit message" path/to/file1 path/to/file2
 *
 * With no file args, auto-detects modified/added files from `git status`.
 * Deleted files must be passed explicitly as: --delete path/to/file
 *
 * Requires: GITHUB_PERSONAL_ACCESS_TOKEN in environment.
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const https = require("https");

const OWNER = "musyavosty";
const REPO = "bicryptov6";
const BRANCH = "main";
const ROOT = path.resolve(__dirname, "..");

// ─── helpers ──────────────────────────────────────────────────────────────────

function apiRequest(method, endpoint, body = null) {
  return new Promise((resolve, reject) => {
    const token = process.env.GITHUB_PERSONAL_ACCESS_TOKEN;
    if (!token) {
      reject(new Error("GITHUB_PERSONAL_ACCESS_TOKEN is not set"));
      return;
    }
    const data = body ? JSON.stringify(body) : null;
    const options = {
      hostname: "api.github.com",
      path: `/repos/${OWNER}/${REPO}${endpoint}`,
      method,
      headers: {
        Authorization: `token ${token}`,
        "User-Agent": "replit-agent",
        Accept: "application/vnd.github.v3+json",
        "Content-Type": "application/json",
        ...(data ? { "Content-Length": Buffer.byteLength(data) } : {}),
      },
    };
    const req = https.request(options, (res) => {
      let raw = "";
      res.on("data", (c) => (raw += c));
      res.on("end", () => {
        if (res.statusCode >= 400) {
          reject(new Error(`GitHub API ${res.statusCode}: ${raw}`));
        } else {
          resolve(JSON.parse(raw));
        }
      });
    });
    req.on("error", reject);
    if (data) req.write(data);
    req.end();
  });
}

function gitStatus() {
  try {
    const out = execSync("git status --porcelain", { cwd: ROOT }).toString();
    const modified = [];
    const deleted = [];
    for (const line of out.split("\n")) {
      if (!line.trim()) continue;
      const status = line.slice(0, 2).trim();
      const file = line.slice(3).trim();
      if (status === "D" || status === "DD") {
        deleted.push(file);
      } else {
        modified.push(file);
      }
    }
    return { modified, deleted };
  } catch {
    return { modified: [], deleted: [] };
  }
}

// ─── main ─────────────────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  if (!args.length) {
    console.error("Usage: node scripts/github-api-push.js \"commit message\" [files...]");
    process.exit(1);
  }

  const message = args[0];
  let filesToPush = [];
  let filesToDelete = [];

  if (args.length > 1) {
    // Explicit file list (supports --delete flag)
    let i = 1;
    while (i < args.length) {
      if (args[i] === "--delete") {
        filesToDelete.push(args[++i]);
      } else {
        filesToPush.push(args[i]);
      }
      i++;
    }
  } else {
    // Auto-detect from git status
    const { modified, deleted } = gitStatus();
    filesToPush = modified;
    filesToDelete = deleted;
  }

  // Resolve to relative paths from repo root
  filesToPush = filesToPush.map((f) =>
    path.relative(ROOT, path.resolve(ROOT, f)).replace(/\\/g, "/")
  );
  filesToDelete = filesToDelete.map((f) =>
    path.relative(ROOT, path.resolve(ROOT, f)).replace(/\\/g, "/")
  );

  // Filter out Replit-internal files that don't belong on Railway
  const SKIP = [".replit", "replit.nix", ".local/", "attached_assets/", ".cache/"];
  filesToPush = filesToPush.filter(
    (f) => !SKIP.some((s) => f === s || f.startsWith(s))
  );
  filesToDelete = filesToDelete.filter(
    (f) => !SKIP.some((s) => f === s || f.startsWith(s))
  );

  if (!filesToPush.length && !filesToDelete.length) {
    console.log("ℹ️  No changed files to push (Replit-internal changes excluded).");
    console.log("    To push specific files: node scripts/github-api-push.js \"msg\" path/to/file");
    process.exit(0);
  }

  console.log(`\n📦  Preparing commit: "${message}"`);
  console.log(`    Modify: ${filesToPush.length} file(s)`);
  console.log(`    Delete: ${filesToDelete.length} file(s)`);

  // 1. Get current HEAD commit + tree on GitHub
  console.log("\n⬇️   Fetching GitHub state...");
  const refData = await apiRequest("GET", `/git/ref/heads/${BRANCH}`);
  const baseCommitSha = refData.object.sha;
  const baseCommit = await apiRequest("GET", `/git/commits/${baseCommitSha}`);
  const baseTreeSha = baseCommit.tree.sha;
  console.log(`    Base commit: ${baseCommitSha.slice(0, 7)} — ${baseCommit.message.split("\n")[0]}`);

  // 2. Create blobs for each modified/added file
  const newTree = [];

  for (const filePath of filesToPush) {
    const absPath = path.resolve(ROOT, filePath);
    if (!fs.existsSync(absPath)) {
      console.warn(`    ⚠️  Skipping (not found): ${filePath}`);
      continue;
    }
    const content = fs.readFileSync(absPath);
    const isText = isTextFile(filePath, content);
    process.stdout.write(`    📄  ${filePath} → creating blob...`);

    const blob = await apiRequest("POST", "/git/blobs", {
      content: content.toString("base64"),
      encoding: "base64",
    });

    newTree.push({
      path: filePath,
      mode: isExecutable(filePath) ? "100755" : "100644",
      type: "blob",
      sha: blob.sha,
    });
    console.log(` ${blob.sha.slice(0, 7)} ✓`);
  }

  // Mark deleted files as null sha (GitHub removes them)
  for (const filePath of filesToDelete) {
    newTree.push({
      path: filePath,
      mode: "100644",
      type: "blob",
      sha: null,
    });
    console.log(`    🗑️   ${filePath} → deleted`);
  }

  // 3. Create new tree (based on the current GitHub tree)
  console.log("\n🌳  Creating tree...");
  const tree = await apiRequest("POST", "/git/trees", {
    base_tree: baseTreeSha,
    tree: newTree,
  });
  console.log(`    Tree: ${tree.sha.slice(0, 7)}`);

  // 4. Create commit
  console.log("📝  Creating commit...");
  const commit = await apiRequest("POST", "/git/commits", {
    message,
    tree: tree.sha,
    parents: [baseCommitSha],
  });
  console.log(`    Commit: ${commit.sha.slice(0, 7)}`);

  // 5. Update branch ref
  console.log(`🔀  Updating ${BRANCH} branch...`);
  await apiRequest("PATCH", `/git/refs/heads/${BRANCH}`, {
    sha: commit.sha,
    force: false,
  });

  console.log(`\n✅  Pushed to github.com/${OWNER}/${REPO} → ${BRANCH}`);
  console.log(`    Commit: ${commit.sha.slice(0, 7)} — ${message}`);
  console.log(`    Railway auto-deploy starts in ~30 seconds.`);
  console.log(`    Track at: https://railway.app\n`);
}

function isTextFile(filePath, buf) {
  const textExts = [".js", ".ts", ".tsx", ".jsx", ".json", ".md", ".sh", ".txt", ".css", ".html", ".sql", ".yml", ".yaml", ".toml", ".env", ".mjs", ".cjs"];
  const ext = path.extname(filePath).toLowerCase();
  return textExts.includes(ext) || !buf.slice(0, 512).includes(0);
}

function isExecutable(filePath) {
  const execExts = [".sh", ".mjs"];
  const ext = path.extname(filePath).toLowerCase();
  const base = path.basename(filePath);
  return execExts.includes(ext) || base === "railway-start.sh";
}

main().catch((err) => {
  console.error("\n❌  Push failed:", err.message);
  process.exit(1);
});
