const { execSync } = require('child_process');

// Get the migration name from command line arguments
const migrationName = process.argv[2];

if (!migrationName) {
  console.error('Error: Migration name is required.');
  process.exit(1);
}

// Build the TypeORM CLI command
const command = `npm run typeorm migration:generate -p ./src/database/migrations/${migrationName}`;

console.log('Running:', command);

// Execute the command
execSync(command, { stdio: 'inherit' });
