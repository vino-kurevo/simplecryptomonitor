module.exports = {
  apps: [
    {
      name: 'monitoring-worker',
      script: './node_modules/.bin/tsx',
      args: 'src/workers/monitoring.ts',
      cwd: '/tmp/cc-agent/61105712/project/backend',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
      },
      error_file: '/tmp/cc-agent/61105712/project/backend/logs/monitoring-error.log',
      out_file: '/tmp/cc-agent/61105712/project/backend/logs/monitoring-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
    },
    {
      name: 'dispatcher-worker',
      script: './node_modules/.bin/tsx',
      args: 'src/workers/dispatcher.ts',
      cwd: '/tmp/cc-agent/61105712/project/backend',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
      },
      error_file: '/tmp/cc-agent/61105712/project/backend/logs/dispatcher-error.log',
      out_file: '/tmp/cc-agent/61105712/project/backend/logs/dispatcher-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
    },
  ],
};
