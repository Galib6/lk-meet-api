import { Injectable } from "@nestjs/common";
import { ENV } from "@src/env";
import {
  AccessToken,
  AccessTokenOptions,
  RoomServiceClient,
  VideoGrant,
} from "livekit-server-sdk";
import { GetConnectionDetailsDTO } from "../dtos/get-connection-details.dto";

@Injectable()
export class LiveKitService {
  private readonly apiKey = ENV.liveKit.apiKey;
  private readonly apiSecret = ENV.liveKit.secret;
  private readonly host = ENV.liveKit.serverUrl;

  private roomService: RoomServiceClient;

  constructor() {
    this.roomService = new RoomServiceClient(
      this.host,
      this.apiKey,
      this.apiSecret
    );
  }

  async createRoom(name: string): Promise<void> {
    try {
      await this.roomService.createRoom({ name });
    } catch (error) {
      if (error.response?.status !== 409) {
        throw error;
      }
    }
  }

  async generateToken(identity: string, roomName: string) {
    const token = new AccessToken(this.apiKey, this.apiSecret, { identity });
    token.addGrant({
      roomJoin: true,
      room: roomName,
      canPublish: true,
      canSubscribe: true,
    });
    return {
      room: roomName,
      identity,
      token: await token.toJwt(),
    };
  }

  async listParticipants(roomName: string): Promise<any[]> {
    const participants = await this.roomService.listParticipants(roomName);
    return participants.map((item) => ({
      name: item?.name,
    }));
  }

  async getConnectionDetails(body: GetConnectionDetailsDTO) {
    const { roomName, ...rest } = body;

    const userInfo = { ...rest, name: rest?.participantName };
    const participantToken = await this.createParticipantToken(
      userInfo,
      roomName
    );

    return {
      serverUrl: this.host,
      roomName,
      participantToken,
      participantName: body?.participantName,
    };
  }

  async createParticipantToken(userInfo: AccessTokenOptions, roomName: string) {
    const token = new AccessToken(this.apiKey, this.apiSecret, userInfo);
    token.ttl = "5m";
    token.addGrant({
      room: roomName,
      roomJoin: true,
      canPublish: true,
      canPublishData: true,
      canSubscribe: true,
    } as VideoGrant);
    return token.toJwt();
  }

  // List all rooms
  async listRooms(): Promise<string[]> {
    const rooms = await this.roomService.listRooms();
    return rooms.map((room) => room.name);
  }

  // Delete a room
  async deleteRoom(name: string): Promise<void> {
    await this.roomService.deleteRoom(name);
    console.log(`Room "${name}" deleted successfully.`);
  }
}
