import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';

type DrizzleClient = ReturnType<typeof createClient>;

declare global {
    // eslint-disable-next-line no-var
    var __drizzleDb: { client: DrizzleClient; db: ReturnType<typeof drizzle> } | undefined;
}

const databaseUrl = process.env.DATABASE_URL ?? 'file:./keystorm.db';
const databaseAuthToken = process.env.DATABASE_AUTH_TOKEN;

const getSingleton = () => {
    if (!globalThis.__drizzleDb) {
        const client = createClient({ authToken: databaseAuthToken, url: databaseUrl });
        const db = drizzle(client);
        globalThis.__drizzleDb = { client, db };
    }

    return globalThis.__drizzleDb;
};

export const db = getSingleton().db;
export const dbClient = getSingleton().client;

let initialized: Promise<void> | undefined;

const SCHEMA_STATEMENTS = [
    'CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))), name TEXT, email TEXT NOT NULL, email_verified INTEGER, image TEXT)',
    'CREATE UNIQUE INDEX IF NOT EXISTS users_email_idx ON users(email)',
    'CREATE TABLE IF NOT EXISTS accounts (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id TEXT NOT NULL, type TEXT NOT NULL, provider TEXT NOT NULL, provider_account_id TEXT NOT NULL, refresh_token TEXT, access_token TEXT, expires_at INTEGER, token_type TEXT, scope TEXT, id_token TEXT, session_state TEXT, FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE)',
    'CREATE UNIQUE INDEX IF NOT EXISTS accounts_provider_provider_account_id_idx ON accounts(provider, provider_account_id)',
    'CREATE TABLE IF NOT EXISTS sessions (id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))), session_token TEXT NOT NULL UNIQUE, user_id TEXT NOT NULL, expires INTEGER NOT NULL, FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE)',
    'CREATE TABLE IF NOT EXISTS verification_token (identifier TEXT NOT NULL, token TEXT NOT NULL, expires INTEGER NOT NULL)',
    'CREATE UNIQUE INDEX IF NOT EXISTS verification_token_identifier_token_idx ON verification_token(identifier, token)',
    'CREATE TABLE IF NOT EXISTS login_codes (id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT NOT NULL, code_hash TEXT NOT NULL, expires_at INTEGER NOT NULL, created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000))',
    'CREATE UNIQUE INDEX IF NOT EXISTS login_codes_email_idx ON login_codes(email)',
];

export const ensureDatabase = () => {
    if (!initialized) {
        const { client } = getSingleton();
        initialized = (async () => {
            await client.batch(SCHEMA_STATEMENTS.map((statement) => ({ sql: statement })));
        })();
    }

    return initialized;
};
