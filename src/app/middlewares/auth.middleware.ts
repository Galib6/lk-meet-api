import { Injectable, NestMiddleware } from "@nestjs/common";
import { JWTHelper } from "../helpers";

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly jwtHelper: JWTHelper) {}
  async use(req: any, res: Response, next: Function) {
    // const token = this.jwtHelper.extractToken(req.headers);
    // if (token) {
    //   const verifiedUser: any = await this.jwtHelper.verify(token);
    //   req.verifiedUser = verifiedUser.user;
    // }
    next();
  }
}
