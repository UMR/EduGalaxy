import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from 'pg';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class DatabaseInitService implements OnModuleInit {
    private readonly logger = new Logger(DatabaseInitService.name);

    constructor(private configService: ConfigService) { }

    async onModuleInit() {
        const shouldAutoInit = this.configService.get('DB_AUTO_INIT', 'true') === 'true';

        if (!shouldAutoInit) {
            this.logger.log('Database auto-initialization is disabled');
            return;
        }

        this.logger.log('🔍 Checking database initialization status...');

        try {
            const needsInitialization = await this.checkIfInitializationNeeded();

            if (needsInitialization) {
                this.logger.log('🚀 Starting database auto-initialization...');
                await this.initializeDatabase();
                this.logger.log('✅ Database initialization completed successfully!');
            } else {
                this.logger.log('ℹ️ Database already initialized, skipping auto-setup');
            }
        } catch (error) {
            this.logger.error('❌ Database initialization failed:', error.message);
            // Don't throw error to prevent app from crashing
            // In production, you might want to handle this differently
        }
    }

    private async checkIfInitializationNeeded(): Promise<boolean> {
        const client = new Client({
            host: this.configService.get('DB_HOST', 'localhost'),
            port: this.configService.get('DB_PORT', 5432),
            user: this.configService.get('DB_USERNAME', 'postgres'),
            password: this.configService.get('DB_PASSWORD', '123456'),
            database: this.configService.get('DB_NAME', 'edugalaxy'),
        });

        try {
            await client.connect();

            // Check if core tables exist
            const result = await client.query(`
                SELECT COUNT(*) as table_count
                FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name IN ('users', 'courses', 'enrollments')
            `);

            const tableCount = parseInt(result.rows[0].table_count);
            await client.end();

            // If we have less than 3 core tables, we need initialization
            return tableCount < 3;

        } catch (error) {
            await client.end();

            if (error.code === '3D000') {
                // Database doesn't exist
                this.logger.log('📭 Database does not exist, will create and initialize');
                return true;
            }

            throw error;
        }
    }

    private async initializeDatabase(): Promise<void> {
        // Step 1: Create database if it doesn't exist
        await this.createDatabaseIfNotExists();

        // Step 2: Execute SQL scripts (including seed data)
        await this.executeSqlScripts();
    }

    private async createDatabaseIfNotExists(): Promise<void> {
        const client = new Client({
            host: this.configService.get('DB_HOST', 'localhost'),
            port: this.configService.get('DB_PORT', 5432),
            user: this.configService.get('DB_USERNAME', 'postgres'),
            password: this.configService.get('DB_PASSWORD', '123456'),
            database: 'postgres', // Connect to default database
        });

        try {
            await client.connect();

            const dbName = this.configService.get('DB_NAME', 'edugalaxy');

            // Check if database exists
            const result = await client.query(
                'SELECT 1 FROM pg_database WHERE datname = $1',
                [dbName]
            );

            if (result.rows.length === 0) {
                await client.query(`CREATE DATABASE "${dbName}"`);
                this.logger.log(`✅ Database "${dbName}" created`);
            } else {
                this.logger.log(`ℹ️ Database "${dbName}" already exists`);
            }

            await client.end();
        } catch (error) {
            await client.end();
            throw error;
        }
    }

    private async executeSqlScripts(): Promise<void> {
        const client = new Client({
            host: this.configService.get('DB_HOST', 'localhost'),
            port: this.configService.get('DB_PORT', 5432),
            user: this.configService.get('DB_USERNAME', 'postgres'),
            password: this.configService.get('DB_PASSWORD', '123456'),
            database: this.configService.get('DB_NAME', 'edugalaxy'),
        });

        try {
            await client.connect();
            this.logger.log('📡 Connected to database for script execution');

            const scriptsDir = path.join(__dirname, '../database/sql-scripts');
            const sqlFiles = this.getSqlFilesInOrder(scriptsDir);

            this.logger.log(`📂 Found ${sqlFiles.length} SQL files to execute`);

            for (const filePath of sqlFiles) {
                const fileName = path.basename(filePath);
                this.logger.log(`📄 Executing: ${fileName}`);

                try {
                    const sqlContent = fs.readFileSync(filePath, 'utf8');
                    const statements = this.parseSqlStatements(sqlContent);

                    for (const statement of statements) {
                        if (statement.trim()) {
                            await client.query(statement);
                        }
                    }

                    this.logger.log(`✅ Successfully executed: ${fileName}`);
                } catch (error) {
                    this.logger.error(`❌ Error executing ${fileName}:`, error.message);
                    throw error;
                }
            }

            await client.end();
        } catch (error) {
            await client.end();
            throw error;
        }
    }

    private getSqlFilesInOrder(scriptsDir: string): string[] {
        const sqlFiles: string[] = [];

        // Root scripts first (setup files)
        if (fs.existsSync(scriptsDir)) {
            const rootFiles = fs.readdirSync(scriptsDir)
                .filter(file => file.endsWith('.sql'))
                .map(file => path.join(scriptsDir, file))
                .sort();
            sqlFiles.push(...rootFiles);
        }

        // Then table scripts
        const tablesDir = path.join(scriptsDir, 'tables');
        if (fs.existsSync(tablesDir)) {
            const tableFiles = fs.readdirSync(tablesDir)
                .filter(file => file.endsWith('.sql'))
                .map(file => path.join(tablesDir, file))
                .sort();
            sqlFiles.push(...tableFiles);
        }

        // Then views
        const viewsDir = path.join(scriptsDir, 'views');
        if (fs.existsSync(viewsDir)) {
            const viewFiles = fs.readdirSync(viewsDir)
                .filter(file => file.endsWith('.sql'))
                .map(file => path.join(viewsDir, file))
                .sort();
            sqlFiles.push(...viewFiles);
        }

        // Finally procedures
        const proceduresDir = path.join(scriptsDir, 'procedures');
        if (fs.existsSync(proceduresDir)) {
            const procedureFiles = fs.readdirSync(proceduresDir)
                .filter(file => file.endsWith('.sql'))
                .map(file => path.join(proceduresDir, file))
                .sort();
            sqlFiles.push(...procedureFiles);
        }

        // Add seed files last
        const seedsDir = path.join(scriptsDir, 'seeds');
        if (fs.existsSync(seedsDir)) {
            const seedFiles = fs.readdirSync(seedsDir)
                .filter(file => file.endsWith('.sql'))
                .map(file => path.join(seedsDir, file))
                .sort();
            sqlFiles.push(...seedFiles);
        }

        return sqlFiles;
    }

    private parseSqlStatements(sqlContent: string): string[] {
        const statements: string[] = [];
        let currentStatement = '';
        let inDollarQuote = false;
        let dollarTag = '';
        let inSingleQuote = false;
        let inDoubleQuote = false;

        const lines = sqlContent.split('\n');

        for (const line of lines) {
            const trimmedLine = line.trim();

            // Skip comment lines
            if (trimmedLine.startsWith('--') || trimmedLine === '') {
                continue;
            }

            let i = 0;
            while (i < line.length) {
                const char = line[i];

                // Handle dollar quoting
                if (char === '$' && !inSingleQuote && !inDoubleQuote) {
                    const dollarMatch = line.slice(i).match(/^(\$[^$]*\$)/);
                    if (dollarMatch) {
                        const foundTag = dollarMatch[1];
                        if (!inDollarQuote) {
                            inDollarQuote = true;
                            dollarTag = foundTag;
                            currentStatement += foundTag;
                            i += foundTag.length;
                            continue;
                        } else if (foundTag === dollarTag) {
                            inDollarQuote = false;
                            dollarTag = '';
                            currentStatement += foundTag;
                            i += foundTag.length;
                            continue;
                        }
                    }
                }

                // Handle quotes
                if (char === "'" && !inDoubleQuote && !inDollarQuote) {
                    inSingleQuote = !inSingleQuote;
                }
                if (char === '"' && !inSingleQuote && !inDollarQuote) {
                    inDoubleQuote = !inDoubleQuote;
                }

                // Handle semicolon
                if (char === ';' && !inSingleQuote && !inDoubleQuote && !inDollarQuote) {
                    currentStatement += char;
                    const statement = currentStatement.trim();
                    if (statement) {
                        statements.push(statement);
                    }
                    currentStatement = '';
                    i++;
                    continue;
                }

                currentStatement += char;
                i++;
            }

            currentStatement += '\n';
        }

        // Add remaining statement
        const finalStatement = currentStatement.trim();
        if (finalStatement) {
            statements.push(finalStatement);
        }

        return statements.filter(stmt => stmt.length > 0);
    }
}
