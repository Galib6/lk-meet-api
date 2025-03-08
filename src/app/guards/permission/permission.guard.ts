import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import {
  PERMISSION_KEY,
  REQUEST_USER_KEY,
} from "@src/app/constants/keys.constants";
import { UserRoleService } from "@src/app/modules/user/services/userRole.service";
import { ENUM_ACL_DEFAULT_ROLES } from "@src/shared";

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,

    /**User service */
    private readonly userRoleService: UserRoleService
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermission = this.reflector.getAllAndOverride(
      PERMISSION_KEY,
      [context.getHandler(), context.getClass()]
    );

    const request = context.switchToHttp().getRequest();
    const userId = request[REQUEST_USER_KEY].id;

    const rolePermissions =
      await this.userRoleService.getUserPermissions(userId);

    if (rolePermissions.roles.includes(ENUM_ACL_DEFAULT_ROLES.SUPER_ADMIN))
      return;

    if (!rolePermissions?.permission.includes(requiredPermission)) {
      throw new ForbiddenException();
    }

    return;
  }
}
