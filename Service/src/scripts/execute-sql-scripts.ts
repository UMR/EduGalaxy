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

        // Get all SQL files in correct execution order
        const sqlFiles: string[] = [];

        // First, get setup files from root directory (001-setup.sql)
        const setupFiles = fs.readdirSync(scriptsDir)
            .filter(file => file.endsWith('.sql') && file.startsWith('001'))
            .map(file => path.join(scriptsDir, file))
            .sort();

        sqlFiles.push(...setupFiles);

        // Then, get files from tables subdirectory (create tables first)
        const tablesDir = path.join(scriptsDir, 'tables');
        if (fs.existsSync(tablesDir)) {
            const tableFiles = fs.readdirSync(tablesDir)
                .filter(file => file.endsWith('.sql'))
                .map(file => path.join(tablesDir, file))
                .sort(); // Sort numerically by filename
            sqlFiles.push(...tableFiles);
        }

        // Then, get other files from views subdirectory
        const viewsDir = path.join(scriptsDir, 'views');
        if (fs.existsSync(viewsDir)) {
            const viewFiles = fs.readdirSync(viewsDir)
                .filter(file => file.endsWith('.sql'))
                .map(file => path.join(viewsDir, file))
                .sort();
            sqlFiles.push(...viewFiles);
        }

        // Then, get files from procedures subdirectory
        const proceduresDir = path.join(scriptsDir, 'procedures');
        if (fs.existsSync(proceduresDir)) {
            const procedureFiles = fs.readdirSync(proceduresDir)
                .filter(file => file.endsWith('.sql'))
                .map(file => path.join(proceduresDir, file))
                .sort();
            sqlFiles.push(...procedureFiles);
        }

        // Finally, get seed data files from root directory (after tables are created)
        const seedFiles = fs.readdirSync(scriptsDir)
            .filter(file => file.endsWith('.sql') && !file.startsWith('001'))
            .map(file => path.join(scriptsDir, file))
            .sort(); // This will execute 006-seed-roles-permissions.sql then 007-seed-users.sql

        sqlFiles.push(...seedFiles);

        console.log(`📂 Found ${sqlFiles.length} SQL files to execute`);

        for (const filePath of sqlFiles) {
            const fileName = path.basename(filePath);
            console.log(`📄 Executing: ${fileName}`);

            try {
                // Skip seed files if data already exists
                if (fileName.startsWith('006-seed-roles') || fileName.startsWith('007-seed-users')) {
                    const checkTable = fileName.startsWith('006-') ? 'roles' : 'users';
                    const checkQuery = `SELECT COUNT(*) as count FROM ${checkTable}`;

                    try {
                        const result = await client.query(checkQuery);
                        const count = parseInt(result.rows[0].count);

                        if (count > 0) {
                            console.log(`⏭️  Skipping ${fileName} - ${checkTable} table already has data (${count} rows)`);
                            continue;
                        }
                    } catch (checkError) {
                        console.log(`⚠️  Could not check ${checkTable} table, proceeding with ${fileName}`);
                    }
                }

                const sqlContent = fs.readFileSync(filePath, 'utf8');

                // For now, execute the entire file as one statement
                // This handles dollar-quoted strings properly
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
                throw error; // Stop execution on error
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
