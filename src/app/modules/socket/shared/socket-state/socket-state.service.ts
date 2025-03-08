import { Injectable } from '@nestjs/common';
import { AuthenticatedSocket, AuthenticatedSocketUser } from './socket-state.adapter';

@Injectable()
export class SocketStateService {
  private socketState = new Map<string, AuthenticatedSocket>();

  public remove(userId: string): boolean {
    const existingSocket = this.socketState.get(userId);

    if (!existingSocket) {
      return true;
    }

    this.socketState.delete(userId);

    return true;
  }

  public add(userId: string, socket: AuthenticatedSocket): boolean {
    this.socketState.set(userId, socket);
    return true;
  }

  public get(userId: string): AuthenticatedSocket {
    return this.socketState.get(userId) || null;
  }

  public updateUserData(userId: string, userData: AuthenticatedSocketUser): AuthenticatedSocket {
    const user = this.socketState.get(userId);
    user.auth = { ...user.auth, ...userData };

    return this.socketState.get(userId) || null;
  }

  public getAll(): AuthenticatedSocket[] {
    const all = [];

    this.socketState.forEach((socket) => all.push(socket));

    return all;
  }

  public getAllByUserIds(userIds: string[]): AuthenticatedSocket[] {
    const all = [];

    this.socketState.forEach((socket) => {
      if (userIds.includes(socket.auth.userId)) {
        all.push(socket);
      }
    });

    return all;
  }
}
