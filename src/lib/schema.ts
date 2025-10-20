import { sql } from 'drizzle-orm';
import { integer, sqliteTableCreator, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

const createTable = sqliteTableCreator((name) => name);

export const users = createTable(
    'users',
    {
        email: text('email').notNull().unique(),
        emailVerified: integer('email_verified', { mode: 'timestamp_ms' }),
        id: text('id').primaryKey().default(sql`lower(hex(randomblob(16)))`),
        image: text('image'),
        name: text('name'),
    },
    (table) => [uniqueIndex('users_email_idx').on(table.email)],
);

export const accounts = createTable(
    'accounts',
    {
        accessToken: text('access_token'),
        expiresAt: integer('expires_at'),
        id: integer('id').primaryKey({ autoIncrement: true }),
        idToken: text('id_token'),
        provider: text('provider').notNull(),
        providerAccountId: text('provider_account_id').notNull(),
        refreshToken: text('refresh_token'),
        scope: text('scope'),
        sessionState: text('session_state'),
        tokenType: text('token_type'),
        type: text('type').notNull(),
        userId: text('user_id')
            .notNull()
            .references(() => users.id, { onDelete: 'cascade' }),
    },
    (table) => [uniqueIndex('accounts_provider_provider_account_id_idx').on(table.provider, table.providerAccountId)],
);

export const sessions = createTable('sessions', {
    expires: integer('expires', { mode: 'timestamp_ms' }).notNull(),
    id: text('id').primaryKey().default(sql`lower(hex(randomblob(16)))`),
    sessionToken: text('session_token').notNull().unique(),
    userId: text('user_id')
        .notNull()
        .references(() => users.id, { onDelete: 'cascade' }),
});

export const verificationTokens = createTable(
    'verification_token',
    {
        expires: integer('expires', { mode: 'timestamp_ms' }).notNull(),
        identifier: text('identifier').notNull(),
        token: text('token').notNull(),
    },
    (table) => [uniqueIndex('verification_token_identifier_token_idx').on(table.identifier, table.token)],
);

export const loginCodes = createTable(
    'login_codes',
    {
        codeHash: text('code_hash').notNull(),
        createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull().default(sql`(unixepoch() * 1000)`),
        email: text('email').notNull(),
        expiresAt: integer('expires_at', { mode: 'timestamp_ms' }).notNull(),
        id: integer('id').primaryKey({ autoIncrement: true }),
    },
    (table) => [uniqueIndex('login_codes_email_idx').on(table.email)],
);
