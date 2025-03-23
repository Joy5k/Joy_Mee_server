import { Server } from 'http';
import mongoose from 'mongoose';
import config from './app/config';
import seedSuperAdmin from './app/DB';
import createApp from './app';
import { initWebSocket } from '../src/app/modules/meeting/websocket';

let server: Server;

async function main() {
  try {
    await mongoose.connect(config.database_url as string);
    
    seedSuperAdmin();
    
    const app = createApp();
    server = app.listen(config.port, () => {
      console.log(`App is listening on port ${config.port}`);
    });

    // Initialize WebSocket server
    initWebSocket(server, config.cors_origin);
    
  } catch (err) {
    console.log(err);
  }
}

main();

// ... rest of your existing server.ts code ...

process.on('unhandledRejection', () => {
  console.log(`😈 unhandledRejection is detected , shutting down ...`);
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }
  process.exit(1);
});

process.on('uncaughtException', () => {
  console.log(`😈 uncaughtException is detected , shutting down ...`);
  process.exit(1);
});
