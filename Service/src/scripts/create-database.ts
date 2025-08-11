import { Client } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const config = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || '123456',
    database: process.env.DB_NAME || 'edugalaxy',
};

async function createDatabase() {
    const client = new Client({
        ...config,
        database: 'postgres',
    });

    try {
        await client.connect();
        console.log('📡 Connected to PostgreSQL server');

        const checkDbQuery = `SELECT 1 FROM pg_database WHERE datname = $1`;
        const result = await client.query(checkDbQuery, [config.database]);

        if (result.rows.length === 0) {
            await client.query(`CREATE DATABASE "${config.database}"`);
            console.log(`✅ Database "${config.database}" created successfully`);
        } else {
            console.log(`ℹ️ Database "${config.database}" already exists`);
        }

    } catch (error) {
        console.error('❌ Error creating database:', error);
        process.exit(1);
    } finally {
        await client.end();
    }
}

if (require.main === module) {
    createDatabase();
}
