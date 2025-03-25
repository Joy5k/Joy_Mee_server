import { Server } from 'http';
import mongoose from 'mongoose';
import config from './app/config';
import seedSuperAdmin from './app/DB';
import createApp from './app';
import { initWebSocket } from '../src/app/modules/meeting/websocket';
import { RoomModel } from './app/modules/room/room.model';

let server: Server;

async function main() {
  try {
    // Database connection
    await mongoose.connect(config.database_url as string);
    await RoomModel.createIndexes();

    // Seed super admin
    seedSuperAdmin();
    
    // Create Express app
    const app = createApp();
    
    // Create HTTP server
    server = app.listen(config.port, () => {
      console.log(`HTTP server listening on port ${config.port}`);
    });

    
    // Initialize WebSocket server with the HTTP server
    initWebSocket(server);

    console.log(`WebSocket server initialized on port ${config.port}`);

  } catch (err) {
    console.error('Server initialization failed:', err);
    process.exit(1);
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
