import { Sequelize } from "sequelize";
import { initModels } from "../models/init";
import { isMainThread } from "worker_threads";
import { logger } from "@b/utils/console";
import { createError } from "@b/utils/error";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import "../types/models";

const SYNC_HASH_FILE = path.join(__dirname, "..", ".sync-hash");

class SequelizeSingleton {
  private static instance: SequelizeSingleton;
  public sequelize: Sequelize;
  public models: ReturnType<typeof initModels>;

  constructor() {
    if (
      !process.env.DB_NAME ||
      !process.env.DB_USER ||
      !process.env.DB_HOST
    ) {
      throw createError({
        statusCode: 500,
        message:
          "Missing required database environment variables. Please check your .env file.",
      });
    }

    this.sequelize = new Sequelize(
      process.env.DB_NAME,
      process.env.DB_USER,
      process.env.DB_PASSWORD || "",
      {
        host: process.env.DB_HOST,
        dialect: "mysql",
        port: Number(process.env.DB_PORT),
        logging: false,
        dialectOptions: { charset: "utf8mb4" },
        define: { charset: "utf8mb4", collate: "utf8mb4_unicode_ci" },
        pool: {
          max: 20,
          min: 2,
          acquire: 30000,
          idle: 10000,
        },
      }
    );

    if (!this.sequelize) {
      throw createError({
        statusCode: 500,
        message: "Failed to create Sequelize instance",
      });
    }

    this.models = this.initModels();
  }

  static getInstance(): SequelizeSingleton {
    if (!SequelizeSingleton.instance) {
      SequelizeSingleton.instance = new SequelizeSingleton();
    }
    return SequelizeSingleton.instance;
  }

  async initialize(): Promise<void> {
    if (isMainThread) {
      await this.syncDatabase();
    }
  }

  getSequelize(): Sequelize {
    return this.sequelize;
  }

  initModels(): ReturnType<typeof initModels> {
    const models = initModels(this.sequelize);
    return models;
  }

  computeModelsHash(): string {
    const modelsDir = path.join(__dirname, "..", "models");
    const isDevelopment = process.env.NODE_ENV === "development";
    const ext = isDevelopment ? ".ts" : ".js";
    const hash = crypto.createHash("md5");

    const processDir = (dir: string) => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      entries.sort((a, b) => a.name.localeCompare(b.name));
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          processDir(fullPath);
        } else if (
          entry.isFile() &&
          path.extname(entry.name) === ext &&
          entry.name !== "init.ts" &&
          entry.name !== "init.js" &&
          !entry.name.includes("index")
        ) {
          const relativePath = path.relative(modelsDir, fullPath);
          const content = fs.readFileSync(fullPath, "utf-8");
          hash.update(relativePath);
          hash.update(content);
        }
      }
    };

    processDir(modelsDir);
    return hash.digest("hex");
  }

  getStoredHash(): string | null {
    try {
      if (fs.existsSync(SYNC_HASH_FILE)) {
        return fs.readFileSync(SYNC_HASH_FILE, "utf-8").trim();
      }
    } catch (_) {}
    return null;
  }

  storeHash(hash: string): void {
    try {
      fs.writeFileSync(SYNC_HASH_FILE, hash, "utf-8");
    } catch (_) {}
  }

  hasModelsChanged(): { changed: boolean; currentHash: string } {
    const currentHash = this.computeModelsHash();
    const storedHash = this.getStoredHash();
    return { changed: storedHash !== currentHash, currentHash };
  }

  async syncDatabase(): Promise<void> {
    try {
      const rawSync = process.env.DB_SYNC;
      const syncMode =
        rawSync === null || rawSync === undefined
          ? undefined
          : rawSync.toLowerCase();

      if (syncMode === "none") {
        await this.sequelize.authenticate();
        return;
      }

      if (syncMode === "force") {
        await this.sequelize.sync({ force: true });
        this.storeHash(this.computeModelsHash());
        return;
      }

      if (syncMode === "alter") {
        await this.sequelize.sync({ alter: true });
        this.storeHash(this.computeModelsHash());
        return;
      }

      // Default: smart sync — only alter if models have changed
      const { changed, currentHash } = this.hasModelsChanged();
      if (changed) {
        await this.sequelize.sync({ alter: true });
        this.storeHash(currentHash);
      } else {
        await this.sequelize.authenticate();
      }
    } catch (error) {
      logger.error("DB", "Database sync failed");
      throw error;
    }
  }
}

export const db = SequelizeSingleton.getInstance();
export const sequelize = db.getSequelize();
export const models = db.models;
export default db;
