#!/usr/bin/env node

/**
 * AI Assistant Setup Script
 * Automates the setup process for the Yellow Books AI Assistant
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log(`
╔════════════════════════════════════════════════╗
║  Yellow Books AI Assistant - Setup Wizard     ║
║  🤖 Gemini AI + Semantic Search + RAG         ║
╚════════════════════════════════════════════════╝
`);

function runCommand(command, description) {
  console.log(`\n📦 ${description}...`);
  try {
    execSync(command, { stdio: 'inherit' });
    console.log(`✅ ${description} - Done\n`);
    return true;
  } catch (error) {
    console.error(`❌ ${description} - Failed`);
    return false;
  }
}

function checkFile(filePath, description) {
  const exists = fs.existsSync(filePath);
  if (exists) {
    console.log(`✅ ${description}`);
  } else {
    console.log(`⚠️  ${description} - Not found`);
  }
  return exists;
}

async function main() {
  console.log('🔍 Checking environment...\n');

  // Check .env file
  const envPath = path.join(process.cwd(), '.env');
  if (!checkFile(envPath, '.env file exists')) {
    console.log('\n⚠️  Creating .env from .env.example...');
    if (fs.existsSync('.env.example')) {
      fs.copyFileSync('.env.example', '.env');
      console.log('✅ .env file created');
    } else {
      console.log('❌ .env.example not found');
    }
  }

  // Check GEMINI_API_KEY in .env
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    if (envContent.includes('GEMINI_API_KEY') && !envContent.includes('your-api-key-here')) {
      console.log('✅ GEMINI_API_KEY is configured\n');
    } else {
      console.log('⚠️  GEMINI_API_KEY not configured in .env\n');
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log('Starting setup...\n');

  // Step 1: Install dependencies
  if (!runCommand('npm install', 'Installing dependencies')) {
    console.error('\n❌ Setup failed at dependencies installation');
    process.exit(1);
  }

  // Step 2: Generate Prisma client
  if (!runCommand('npx prisma generate', 'Generating Prisma client')) {
    console.error('\n❌ Setup failed at Prisma generation');
    process.exit(1);
  }

  // Step 3: Run migrations
  console.log('\n📦 Running database migrations...');
  console.log('⚠️  This will prompt you for migration name if needed');
  try {
    execSync('npx prisma migrate dev --name add_embedding_to_yellowbook', { stdio: 'inherit' });
    console.log('✅ Migrations complete\n');
  } catch (error) {
    console.log('⚠️  Migration may have already been applied or failed');
  }

  console.log('\n' + '='.repeat(50));
  console.log('\n✨ Setup complete!\n');

  console.log('📝 Next steps:\n');
  console.log('1. Generate embeddings for all businesses:');
  console.log('   npm run ai:embed\n');
  console.log('2. Start the API server:');
  console.log('   npm run start:api\n');
  console.log('3. Start the web server (in another terminal):');
  console.log('   npm run start:web\n');
  console.log('4. Open your browser:');
  console.log('   http://localhost:4200/assistant\n');

  console.log('📚 Documentation:');
  console.log('   - Quick Start: QUICKSTART_AI.md');
  console.log('   - Full Docs:   AI_ASSISTANT_README.md');
  console.log('   - Checklist:   IMPLEMENTATION_CHECKLIST.md\n');

  console.log('🎉 Happy coding!\n');
}

main().catch(error => {
  console.error('❌ Setup failed:', error);
  process.exit(1);
});
