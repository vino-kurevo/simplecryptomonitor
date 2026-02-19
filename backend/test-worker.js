// Test worker to demonstrate PM2 auto-restart functionality
// This simulates a worker process for testing purposes

console.log('[TEST-WORKER] Starting...');

let counter = 0;

const interval = setInterval(() => {
  counter++;
  console.log(`[TEST-WORKER] Heartbeat ${counter} - ${new Date().toISOString()}`);

  // Simulate work
  if (counter % 5 === 0) {
    console.log(`[TEST-WORKER] Checkpoint: Processed ${counter} cycles`);
  }

  // Auto-exit after 30 seconds for testing
  if (counter >= 30) {
    console.log('[TEST-WORKER] Test complete, exiting...');
    clearInterval(interval);
    process.exit(0);
  }
}, 1000);

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('[TEST-WORKER] Received SIGINT, shutting down gracefully...');
  clearInterval(interval);
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('[TEST-WORKER] Received SIGTERM, shutting down gracefully...');
  clearInterval(interval);
  process.exit(0);
});

console.log('[TEST-WORKER] Ready and running');
