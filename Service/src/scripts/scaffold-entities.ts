import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const execAsync = promisify(exec);

const config = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || '123456',
    database: process.env.DB_NAME || 'edugalaxy',
};

async function scaffoldEntities() {
    try {
        console.log('🔧 Scaffolding entities from database...');

        // Create output directory if it doesn't exist
        const outputDir = path.join(__dirname, '../entities/generated');
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        // Clear existing generated files to avoid conflicts
        const existingFiles = fs.readdirSync(outputDir);
        existingFiles.forEach(file => {
            if (file.endsWith('.ts')) {
                fs.unlinkSync(path.join(outputDir, file));
                console.log(`🗑️ Removed existing file: ${file}`);
            }
        });

        // Build the scaffolding command with better error handling
        const command = `typeorm-model-generator ` +
            `-h ${config.host} ` +
            `-d ${config.database} ` +
            `-u ${config.username} ` +
            `-x ${config.password} ` +
            `-e postgres ` +
            `-o ${outputDir} ` +
            `--noConfig ` +
            `--cf pascal ` +
            `--cp camel ` +
            `--ce pascal ` +
            `--pv public ` +
            `--ssl false ` +
            `--skipTables migrations ` +
            `--relationIds true ` +
            `--skipSchema false`;

        console.log('⚙️ Executing scaffolding command...');
        console.log(`📍 Output directory: ${outputDir}`);
        console.log(`🔗 Database: ${config.host}:${config.port}/${config.database}`);

        try {
            const { stdout, stderr } = await execAsync(command, {
                timeout: 60000, // 60 seconds timeout
                maxBuffer: 1024 * 1024 // 1MB buffer
            });

            if (stdout) {
                console.log('✅ Scaffolding output:', stdout);
            }

            if (stderr && !stderr.includes('warning')) {
                console.error('❌ Scaffolding errors:', stderr);
                throw new Error(stderr);
            } else if (stderr) {
                console.log('⚠️ Scaffolding warnings:', stderr);
            }

        } catch (execError: any) {
            console.error('❌ Command execution failed:', execError.message);

            // Try alternative approach with simpler parameters
            console.log('🔄 Trying with simplified parameters...');

            const simpleCommand = `typeorm-model-generator ` +
                `-h ${config.host} ` +
                `-d ${config.database} ` +
                `-u ${config.username} ` +
                `-x ${config.password} ` +
                `-e postgres ` +
                `-o ${outputDir} ` +
                `--noConfig`;

            const { stdout: simpleStdout, stderr: simpleStderr } = await execAsync(simpleCommand, {
                timeout: 60000,
                maxBuffer: 1024 * 1024
            });

            if (simpleStdout) {
                console.log('✅ Simple scaffolding output:', simpleStdout);
            }

            if (simpleStderr) {
                console.log('⚠️ Simple scaffolding warnings:', simpleStderr);
            }
        }

        // List generated files
        const generatedFiles = fs.readdirSync(outputDir).filter(file => file.endsWith('.ts'));

        if (generatedFiles.length === 0) {
            console.log('⚠️ No TypeScript files were generated. This might indicate:');
            console.log('   - Database connection issues');
            console.log('   - No tables exist in the database');
            console.log('   - Permissions issues');
            console.log('   - Schema complexity causing generator failures');
            return;
        }

        console.log(`📁 Generated ${generatedFiles.length} entity files:`);
        generatedFiles.forEach(file => {
            console.log(`   - ${file}`);
        });

        // Post-process generated files to fix common issues
        console.log('🔧 Post-processing generated files...');
        generatedFiles.forEach(file => {
            const filePath = path.join(outputDir, file);
            let content = fs.readFileSync(filePath, 'utf8');

            // Fix common issues in generated files
            content = content.replace(/import.*typeorm.*\n/g, (match) => {
                // Ensure proper TypeORM imports
                if (!match.includes('Entity')) {
                    return match.replace('import {', 'import { Entity,');
                }
                return match;
            });

            // Add proper decorators if missing
            if (!content.includes('@Entity')) {
                const className = file.replace('.ts', '');
                content = content.replace(`export class ${className}`, `@Entity()\nexport class ${className}`);
            }

            fs.writeFileSync(filePath, content);
        });

        console.log('🎉 Entity scaffolding completed successfully!');
        console.log('\n📋 Next steps:');
        console.log('1. Review generated entities in src/entities/generated/');
        console.log('2. Move/rename entities as needed to src/entities/');
        console.log('3. Update your TypeORM configuration to use new entities');
        console.log('4. Update your services and repositories to use new entities');

    } catch (error: any) {
        console.error('❌ Error scaffolding entities:', error.message);
        console.error('\n🔍 Troubleshooting tips:');
        console.error('1. Ensure database is running and accessible');
        console.error('2. Check database credentials in .env file');
        console.error('3. Verify tables exist in the database');
        console.error('4. Check for complex relationships that might cause issues');
        console.error('5. Try running: npm install -g typeorm-model-generator');

        // Don't exit with error, just log it
        console.error('\n💡 You can manually create entities if scaffolding continues to fail');
    }
}

if (require.main === module) {
    scaffoldEntities();
}
