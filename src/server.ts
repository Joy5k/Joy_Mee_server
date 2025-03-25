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
    await mongoose.connect(config.database_url as string);
    await RoomModel.createIndexes();

    seedSuperAdmin();
    
    const app = createApp();
    server = app.listen(config.port, () => {
      console.log(`App is listening on port ${config.port}`);
    });
    const corsOrigin = config.NODE_ENV === 'development' 
    ? 'https://your-frontend-domain.com' 
    : 'http://localhost:3000';
  
    // Initialize WebSocket server
    initWebSocket(server,corsOrigin);
    
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
