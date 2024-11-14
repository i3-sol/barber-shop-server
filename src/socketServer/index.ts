import cron from "node-cron"
import { Server } from 'socket.io'
import * as socketIO from 'socket.io'

export const setupSocketServer = (server: any) => {
  const io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  })

  io.on('connection', (socket: socketIO.Socket) => {
    console.log(socket.id + ' user connected.')

    // request balance
    socket.on('request', async () => {

    })
  })

  // broadcast
  cron.schedule("*/5 * * * * *", async () => {
    io.emit('globalInfos', {});
  });

  // Gracefully handle application termination
  const closeServer = () => {
    server.close(() => {
      console.log('Socket server closed');
      process.exit(0);
    });
  }

  process.on('SIGINT', closeServer); // Handle CTRL+C
  process.on('SIGTERM', closeServer); // Handle termination signals
}