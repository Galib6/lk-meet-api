import { SetMetadata } from "@nestjs/common";
import { AUTH_TYPE_KEY } from "../constants/keys.constants";
import { AuthType } from "../enums/auth-type.enum";

export const Auth = (...authTypes: AuthType[]) => {
  // if (
  //   authTypes.includes(AuthType.Permission) &&
  //   !authTypes.includes(AuthType.Bearer)
  // ) {
  //   throw new Error(
  //     "AuthType.Bearer requires AuthType.Permission to be included.",
  //   );
  // }
  return SetMetadata(AUTH_TYPE_KEY, authTypes);
};
