import dotenv from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, '..', '.env') });

const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    database: process.env.DB_NAME || 'cardinal_alo',
    user: process.env.DB_USER || 'user1808',
    password: process.env.DB_PASSWORD || '0000',
    poolSize: parseInt(process.env.DB_POOL_SIZE || '4', 10),
  },
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },
  api: {
    provider: process.env.LLM_PROVIDER || 'groq',
    groqKey: process.env.GROQ_API_KEY || null,
    mistralKey: process.env.MISTRAL_API_KEY || null,
    openrouterKey: process.env.OPENROUTER_API_KEY || null,
    hfKey: process.env.HF_API_KEY || null,
    geminiKey: process.env.GEMINI_API_KEY || null,
    useApi: process.env.USE_API === 'true',
    groqQuota: process.env.GROQ_QUOTA || '60',
    groqPerTick: process.env.GROQ_PER_TICK || '10',
    mistralQuota: process.env.MISTRAL_QUOTA || '50',
    mistralPerTick: process.env.MISTRAL_PER_TICK || '10',
    openrouterQuota: process.env.OPENROUTER_QUOTA || '200',
    openrouterPerTick: process.env.OPENROUTER_PER_TICK || '20',
    hfQuota: process.env.HF_QUOTA || '100',
    hfPerTick: process.env.HF_PER_TICK || '10',
    geminiQuota: process.env.GEMINI_QUOTA || '60',
    geminiPerTick: process.env.GEMINI_PER_TICK || '10',
    ollamaModel: process.env.OLLAMA_MODEL || 'phi3.5:3.8b-mini-instruct-q4_K_M',
    ollamaUrl: process.env.OLLAMA_URL || 'http://localhost:11434',
  },
  wa: {
    sessionPath: process.env.WA_SESSION_PATH || './wa_session',
  },
  // D91 N3 : débit sortant plafonné (protection du numéro, client non officiel).
  notifications: {
    intervalMs: parseInt(process.env.NOTIF_INTERVAL_MS || '4000', 10),
    batchSize: parseInt(process.env.NOTIF_BATCH_SIZE || '1', 10),
    maxAttempts: parseInt(process.env.NOTIF_MAX_ATTEMPTS || '5', 10),
  },
  models: {
    path: resolve(__dirname, '..', 'models'),
    intent: process.env.MODEL_INTENT || 'intent.onnx',
    ner: process.env.MODEL_NER || 'ner.onnx',
    combat: process.env.MODEL_COMBAT || 'combat.onnx',
    embed: process.env.MODEL_EMBED || 'embed.onnx',
  },
  game: {
    maxPlayers: parseInt(process.env.MAX_PLAYERS || '300', 10),
    tickRateMs: parseInt(process.env.TICK_RATE_MS || '1000', 10),
    startingYrds: parseInt(process.env.STARTING_YRDS || '500', 10),
    startingZone: process.env.STARTING_ZONE || 'ZONE_NEU_CAP_001',
    gmPhones: (process.env.GM_PHONES || '').split(',').map(s => s.trim()).filter(Boolean),
    // D85 : durée de validité d'une demande en mariage (paramètre de configuration).
    proposalTtlHours: parseInt(process.env.PROPOSAL_TTL_HOURS || '48', 10),
  },
  get dbUrl() {
    return `postgresql://${this.db.user}:${this.db.password}@${this.db.host}:${this.db.port}/${this.db.database}`;
  },
};

export default config;
