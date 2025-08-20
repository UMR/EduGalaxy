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


async function executeSqlScripts() {
    const client = new Client(config);

    try {
        await client.connect();
        console.log('📡 Connected to database');

        const scriptsDir = path.join(__dirname, '../database/sql-scripts');
        const sqlFiles: string[] = [];

        // Always run setup files first
        const setupFiles = fs.readdirSync(scriptsDir)
            .filter(file => file.endsWith('.sql') && file.startsWith('001'))
            .map(file => path.join(scriptsDir, file))
            .sort();

        sqlFiles.push(...setupFiles);

        // Handle table creation files with data preservation
        const tablesDir = path.join(scriptsDir, 'tables');
        if (fs.existsSync(tablesDir)) {
            const tableFiles = fs.readdirSync(tablesDir)
                .filter(file => file.endsWith('.sql'))
                .map(file => path.join(tablesDir, file))
                .sort();
            sqlFiles.push(...tableFiles);
        }

        // Handle views (safe to recreate)
        const viewsDir = path.join(scriptsDir, 'views');
        if (fs.existsSync(viewsDir)) {
            const viewFiles = fs.readdirSync(viewsDir)
                .filter(file => file.endsWith('.sql'))
                .map(file => path.join(viewsDir, file))
                .sort();
            sqlFiles.push(...viewFiles);
        }

        // Handle procedures (safe to recreate)
        const proceduresDir = path.join(scriptsDir, 'procedures');
        if (fs.existsSync(proceduresDir)) {
            const procedureFiles = fs.readdirSync(proceduresDir)
                .filter(file => file.endsWith('.sql'))
                .map(file => path.join(proceduresDir, file))
                .sort();
            sqlFiles.push(...procedureFiles);
        }

        // Handle seed files - check if they exist in seeds folder first
        const seedsDir = path.join(scriptsDir, 'seeds');
        if (fs.existsSync(seedsDir)) {
            const seedFiles = fs.readdirSync(seedsDir)
                .filter(file => file.endsWith('.sql'))
                .map(file => path.join(seedsDir, file))
                .sort();
            sqlFiles.push(...seedFiles);
        } else {
            // Fallback to root level seed files
            const seedFiles = fs.readdirSync(scriptsDir)
                .filter(file => file.endsWith('.sql') && !file.startsWith('001'))
                .map(file => path.join(scriptsDir, file))
                .sort();
            sqlFiles.push(...seedFiles);
        }

        console.log(`📂 Found ${sqlFiles.length} SQL files to execute`);

        for (const filePath of sqlFiles) {
            const fileName = path.basename(filePath);
            console.log(`📄 Executing: ${fileName}`);

            try {
                // Check for existing data before running destructive operations
                if (await shouldSkipFile(client, fileName, filePath)) {
                    continue;
                }

                const sqlContent = fs.readFileSync(filePath, 'utf8');
                const cleanedContent = sqlContent
                    .split('\n')
                    .filter(line => {
                        const trimmed = line.trim();
                        return trimmed && !trimmed.startsWith('--');
                    })
                    .join('\n')
                    .trim();

                if (cleanedContent) {
                    try {
                        await client.query(cleanedContent);
                        console.log(`✅ Successfully executed: ${fileName}`);
                    } catch (stmtError) {
                        console.error(`❌ Error in file: ${fileName}`);
                        console.error(`   Error: ${stmtError.message}`);
                        throw stmtError;
                    }
                }
            } catch (error) {
                console.error(`❌ Error executing ${fileName}:`, error.message);
                throw error;
            }
        }

        console.log('🎉 All SQL scripts executed successfully');

    } catch (error) {
        console.error('❌ Error executing SQL scripts:', error);
        process.exit(1);
    } finally {
        await client.end();
    }
}

if (require.main === module) {
    executeSqlScripts();
}

async function shouldSkipFile(client: Client, fileName: string, filePath: string): Promise<boolean> {
    if (fileName.includes('seed') || filePath.includes('/seeds/')) {
        try {
            const tables = ['users', 'roles', 'permissions', 'courses', 'enrollments'];
            let hasData = false;

            for (const table of tables) {
                try {
                    const result = await client.query(`SELECT COUNT(*) as count FROM ${table} WHERE id IS NOT NULL LIMIT 1`);
                    if (result.rows.length > 0 && parseInt(result.rows[0].count) > 0) {
                        hasData = true;
                        break;
                    }
                } catch (tableError) {
                    continue;
                }
            }

            if (hasData) {
                console.log(`⏭️  Skipping ${fileName} - Database already contains data`);
                return true;
            }
        } catch (error) {
            console.log(`⚠️  Could not check for existing data, proceeding with ${fileName}`);
        }
    }

    if (fileName.includes('users.sql') || fileName.includes('005-users')) {
        try {
            const result = await client.query(`
                SELECT COUNT(*) as count 
                FROM information_schema.tables 
                WHERE table_name = 'users' AND table_schema = 'public'
            `);

            if (result.rows.length > 0 && parseInt(result.rows[0].count) > 0) {
                try {
                    const dataCheck = await client.query('SELECT COUNT(*) as count FROM users');
                    if (parseInt(dataCheck.rows[0].count) > 0) {
                        console.log(`⏭️  Skipping ${fileName} - Users table already exists with data`);
                        return true;
                    }
                } catch (dataError) {
                    console.log(`⏭️  Skipping ${fileName} - Users table exists`);
                    return true;
                }
            }
        } catch (error) {
            console.log(`⚠️  Could not check users table, proceeding with ${fileName}`);
        }
    }

    if (fileName.includes('enrollments.sql') || fileName.includes('004-enrollments')) {
        try {
            const result = await client.query(`
                SELECT COUNT(*) as count 
                FROM information_schema.tables 
                WHERE table_name = 'enrollments' AND table_schema = 'public'
            `);

            if (result.rows.length > 0 && parseInt(result.rows[0].count) > 0) {
                try {
                    const dataCheck = await client.query('SELECT COUNT(*) as count FROM enrollments');
                    if (parseInt(dataCheck.rows[0].count) > 0) {
                        console.log(`⏭️  Skipping ${fileName} - Enrollments table already exists with data`);
                        return true;
                    }
                } catch (dataError) {
                    console.log(`⏭️  Skipping ${fileName} - Enrollments table exists`);
                    return true;
                }
            }
        } catch (error) {
            console.log(`⚠️  Could not check enrollments table, proceeding with ${fileName}`);
        }
    }

    return false;
}
