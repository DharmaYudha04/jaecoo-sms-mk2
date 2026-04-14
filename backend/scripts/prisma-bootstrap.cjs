
const { execSync } = require('child_process');
const fs = require('fs');

try {
  if (!fs.existsSync('.env') && fs.existsSync('.env.example')) {
    console.log('⚠️  .env not found, using .env.example temporarily');
    process.env = { ...process.env };
  }

  console.log('🚀 Running prisma generate...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('✅ Prisma client generated');
} catch (err) {
  console.warn('⚠️ Prisma generate failed (will retry during build)');
}
