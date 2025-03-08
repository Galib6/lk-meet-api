import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { JwtModule } from "@nestjs/jwt";
import { UserModule } from "../modules/user/user.module";
import { AccessTokenGuard } from "./access-token/access-token.guard";
import { AuthenticationGuard } from "./authentication/authentication.guard";
import { PermissionGuard } from "./permission/permission.guard";

@Module({
  imports: [
    // jwt access for token guard imports
    JwtModule,
    UserModule,
  ],
  providers: [
    /** implementing guard to globally for all api */
    {
      provide: APP_GUARD,
      useClass: AuthenticationGuard,
    },
    /**Importing guards to the module as provider */
    AccessTokenGuard,
    PermissionGuard,
  ],
  exports: [AccessTokenGuard, PermissionGuard],
})
export class GuardsModule {}
