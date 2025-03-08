/* eslint-disable @typescript-eslint/ban-types */
import { INestApplicationContext, WebSocketAdapter } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';
import socketio from 'socket.io';
import { SocketStateService } from './socket-state.service';

export interface AuthenticatedSocketUser {
  readonly userId?: string;
}

export interface AuthenticatedSocket extends socketio.Socket {
  auth: AuthenticatedSocketUser;
}

export class SocketStateAdapter extends IoAdapter implements WebSocketAdapter {
  public constructor(
    private readonly app: INestApplicationContext,
    private readonly socketStateService: SocketStateService,
  ) {
    super(app);
  }

  public createIOServer(port: number, options: socketio.ServerOptions): socketio.Server {
    const server = super.createIOServer(port, options);
    server.use(async (socket: AuthenticatedSocket, next) => {
      return next();
    });

    return server;
  }

  public bindClientConnect(server: socketio.Server, callback: Function): void {
    server.on('connection', (socket: AuthenticatedSocket) => {
      const userId = socket.handshake.query?.userId as string;
      if (!userId) {
        socket.auth = null;
      } else {
        socket.auth = {
          userId,
        };
      }

      if (socket.auth) {
        this.socketStateService.add(socket?.auth?.userId, socket);

        socket.on('disconnect', () => {
          this.socketStateService.remove(socket.auth.userId);
          socket.removeAllListeners('disconnect');
        });
      }

      callback(socket);
    });
  }
}
