// Keep the original focused command while sharing the protected database runner.
process.argv.push('--auth-only');
require('./run-integration.cjs');
