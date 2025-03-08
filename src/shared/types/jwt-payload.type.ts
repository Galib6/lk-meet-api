import { User } from "@src/app/modules/user/entities/user.entity";

export type JwtPayloadType = Pick<User, "email"> & {
  roles: string[];
  permissions: string[];
  iat: number;
  exp: number;
};
