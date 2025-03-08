import { Injectable } from "@nestjs/common";
import { ENV } from "@src/env";
import * as bcrypt from "bcrypt";

@Injectable()
export class BcryptHelper {
  constructor() {}
  public hash(plainText: string, saltRounds: number = ENV.jwt.jwtSaltRounds) {
    return bcrypt.hash(plainText, saltRounds);
  }

  public compareHash(plainText: string, hashString: string) {
    return bcrypt.compare(plainText, hashString);
  }
}
