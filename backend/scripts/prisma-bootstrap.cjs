
const { execSync } = require('child_process');
const fs = require('fs');

function run(command) {
  execSync(command, { stdio: 'inherit' });
}

function shouldRunMigrations() {
  return process.env.VERCEL === '1' && Boolean(process.env.DATABASE_URL);
}

try {
  if (!fs.existsSync('.env') && fs.existsSync('.env.example')) {
    console.log('⚠️  .env not found, using .env.example temporarily');
    process.env = { ...process.env };
  }

  console.log('🚀 Running prisma generate...');
  run('npx prisma generate');
  console.log('✅ Prisma client generated');

  if (shouldRunMigrations()) {
    console.log('🚀 Running prisma migrate deploy for Vercel build...');
    run('npx prisma migrate deploy');
    console.log('✅ Prisma migrations applied');
  }
} catch (err) {
  console.warn('⚠️ Prisma generate failed (will retry during build)');
}
