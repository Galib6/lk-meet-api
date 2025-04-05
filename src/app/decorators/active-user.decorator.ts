import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { REQUEST_USER_KEY, SOCKET_ID } from "../constants/keys.constants";

export interface IActiveUser {
  id: number;
  name: string;
  roles: string[];
  socketId: string;
}

export const ActiveUser = createParamDecorator(
  (field: keyof IActiveUser | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user: IActiveUser = request[REQUEST_USER_KEY];
    const socketId: IActiveUser = request[SOCKET_ID];
    return field ? user?.[field] : { ...user, socketId };
  }
);
