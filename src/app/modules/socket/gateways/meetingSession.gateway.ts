import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";

@WebSocketGateway({ namespace: "/meeting-session", cors: { origin: "*" } })
export class MeetingSessionGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;

  // Keep only one socket per user
  users: Record<number, string> = {};

  async handleConnection(client: Socket) {
    const userId = Number(client.handshake.query.userId);
    if (!userId) {
      client.disconnect();
      return;
    }

    // Register the new connection
    this.users[userId] = client.id;
  }

  async handleDisconnect(client: Socket) {
    const userId = Number(client.handshake.query.userId);
    if (userId && this.users[userId] === client.id) {
      delete this.users[userId];
    }
  }

  async sendDataToSingleUser(
    userId: number,
    eventName: string,
    data: any
  ): Promise<boolean> {
    const retryCount = 5;

    const sendData = async (): Promise<boolean> => {
      const socketId = this.users[userId];
      if (socketId) {
        this.server.to(socketId).emit(eventName, data);
        return true;
      }
      return false;
    };

    if (await sendData()) return true;

    for (let i = 0; i < retryCount; i++) {
      await new Promise((res) => setTimeout(res, 1000));
      if (await sendData()) return true;
    }

    return false;
  }
}
