import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { REQUEST_USER_KEY } from "@src/app/constants/keys.constants";
import { RequestMethods } from "@src/app/enums/common.enums";
import { ENV } from "@src/env";
import { Request } from "express";

@Injectable()
export class AccessTokenGuard implements CanActivate {
  constructor(
    /**
     * jwt service
     */
    private readonly jwtService: JwtService

    /**
     * inject JWT configuration
     */
  ) {}
  public async canActivate(context: ExecutionContext): Promise<boolean> {
    //Extract the request form execution context
    const request = context.switchToHttp().getRequest();
    //extract token for header

    const token = this.extractRequestFormHeader(request);

    //validate the token
    if (!token) {
      throw new UnauthorizedException();
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: ENV.jwt.secret,
      });
      request[REQUEST_USER_KEY] = payload.user;

      //inserting createdBy and updatedBy
      if (request.method === RequestMethods.POST) {
        request.body.createdBy = payload.user.id;
      } else if (request.method === RequestMethods.PUT) {
        request.body.updatedBy = payload.user.id;
      } else if (request.method === RequestMethods.PATCH) {
        request.body.updatedBy = payload.user.id;
      }
    } catch {
      throw new UnauthorizedException();
    }

    return true;
  }

  private extractRequestFormHeader(request: Request): string {
    const [, token] = request.headers.authorization?.split(" ") ?? [];
    return token;
  }
}
