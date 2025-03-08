import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";

import { AUTH_TYPE_KEY } from "@src/app/constants/keys.constants";
import { AuthType } from "@src/app/enums/auth-type.enum";
import { AccessTokenGuard } from "../access-token/access-token.guard";
import { PermissionGuard } from "../permission/permission.guard";

@Injectable()
export class AuthenticationGuard implements CanActivate {
  private static readonly defaultAuthType = AuthType.Bearer;

  private readonly authTypeGuardMap: Record<
    AuthType,
    CanActivate | CanActivate[]
  > = {
    [AuthType.Bearer]: this.accessTokenGuards,
    [AuthType.None]: { canActivate: () => true },
    [AuthType.Permission]: this.permissionGuard,
  };
  constructor(
    private readonly reflector: Reflector,
    private readonly accessTokenGuards: AccessTokenGuard,
    private readonly permissionGuard: PermissionGuard
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    //auth type
    //boiler plate code
    let authType = this.reflector.getAllAndOverride(AUTH_TYPE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]) ?? [AuthenticationGuard.defaultAuthType];

    //if api need to authenticate with permission meta data then authType need to added authentication token by default
    if (
      authType.includes(AuthType.Permission) &&
      !authType.includes(AuthType.Bearer)
    ) {
      authType = [AuthType.Bearer, ...authType];
    }

    //array of guards
    const guards = authType.map((type) => this.authTypeGuardMap[type]).flat();

    const result = {};

    //Loop guards canActivate
    for (let index = 0; index < guards.length; index++) {
      const instance = guards[index];
      const canActivate = await Promise.resolve(
        instance.canActivate(context)
      ).catch((err) => ({
        error: err,
      }));
      //result set to result array
      result[authType?.[index]] = canActivate;
    }

    const authenticated =
      result[AuthType.Bearer] === true || result[AuthType.None] === true;

    const havePermission = result[AuthType.Permission]
      ? result[AuthType.Permission] === true
      : true;

    if (authenticated && havePermission) {
      return true;
    }

    if (!havePermission) {
      throw new ForbiddenException("User don't have api access permission");
    }

    throw new UnauthorizedException("Unauthorized token or token expired");
  }
}
