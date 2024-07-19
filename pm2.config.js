module.exports = {
    apps: [
      {
        name: 'SpareRoomBot',
        script: './index.js',
        watch: false,
        autorestart: true,
        max_restarts: 5,
        restart_delay: 5000,
        error_file: './logs/spareRoomBot-error.log',
        out_file: './logs/spareRoomBot-out.log',
        log_date_format: 'YYYY-MM-DD HH:mm Z',
        env: {
          NODE_ENV: 'production',
          // Add other environment variables here if needed
        },
      },
    ],
  };
