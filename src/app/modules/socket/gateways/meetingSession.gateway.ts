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

  async sendDataToSingleUser(userId: number, eventName: string, data: any) {
    const userDetails = this.users[userId];
    if (userDetails && userDetails?.socketIds?.length) {
      userDetails?.socketIds?.forEach((id) => {
        this.server.to(id).emit(eventName, data);
      });
    }
  }
}
