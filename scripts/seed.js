// This script can be run with: npx ts-node scripts/seed.js or node scripts/seed.js
// Make sure Prisma is set up before running

const { spawn } = require('child_process');

const child = spawn('npx', ['tsx', 'lib/seed.ts'], {
  cwd: __dirname + '/..',
  stdio: 'inherit',
});

child.on('exit', (code) => {
  process.exit(code);
});
