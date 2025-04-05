import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { Server } from "socket.io";

@WebSocketGateway({ namespace: "/meeting-session", cors: { origin: "*" } })
export class MeetingSessionGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  constructor() {}

  @WebSocketServer() server: Server;
  users: Record<number, { socketIds: string[] }> = {};

  async handleConnection(client: any) {
    const userId = Number(client.handshake.query.userId);
    if (!userId) {
      client.disconnect();
      return;
    }
    if (this.users[userId]) {
      this.users[userId].socketIds.push(client?.id);
      return;
    }
    this.users[userId] = { socketIds: [client.id] };
  }

  async handleDisconnect(client: any) {
    const userId = Number(client?.handshake?.query?.userId);
    if (userId) {
      this.users[userId].socketIds = this.users[userId].socketIds.filter(
        (id) => id !== client?.id
      );
    }
  }

  async sendDataToSingleUser(userId: number, eventName: string, data: any, socketId: string) {
    const retryCount = 5
    const sendData = async (): Promise<boolean> => {
      const userDetails = this.users[userId];
      if (userDetails && userDetails?.socketIds?.length) {
        const socketId = userDetails?.socketIds?.find(item=> item === socketId)
      if(socketId){
        this.server.to(socketId).emit(eventName, data);
      }
        return true;
      }
      return false;
    };

    // First attempt
    if (await sendData()) {
      return true;
    }

    // Retry logic
    for (let i = 0; i < retryCount; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000)); 
      if (await sendData()) {
        return true;
      }
    }

    return false;
  }
}
