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
