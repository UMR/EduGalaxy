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

        // Build the scaffolding command
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
            `--ssl false`;

        console.log('⚙️ Executing scaffolding command...');
        console.log(`📍 Output directory: ${outputDir}`);

        const { stdout, stderr } = await execAsync(command);

        if (stdout) {
            console.log('✅ Scaffolding output:', stdout);
        }

        if (stderr) {
            console.log('⚠️ Scaffolding warnings:', stderr);
        }

        // List generated files
        const generatedFiles = fs.readdirSync(outputDir);
        console.log(`📁 Generated ${generatedFiles.length} entity files:`);
        generatedFiles.forEach(file => {
            console.log(`   - ${file}`);
        });

        console.log('🎉 Entity scaffolding completed successfully!');
        console.log('\n📋 Next steps:');
        console.log('1. Review generated entities in src/entities/generated/');
        console.log('2. Move/rename entities as needed to src/entities/');
        console.log('3. Update your TypeORM configuration to use new entities');
        console.log('4. Update your services and repositories to use new entities');

    } catch (error) {
        console.error('❌ Error scaffolding entities:', error);
        process.exit(1);
    }
}

if (require.main === module) {
    scaffoldEntities();
}
