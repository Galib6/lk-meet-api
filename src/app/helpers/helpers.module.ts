import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { BcryptHelper } from "./bcrypt.helper";
import { JWTHelper } from "./jwt.helper";
import { QueryHelper } from "./query.helper";

const HELPERS = [BcryptHelper, JWTHelper, QueryHelper];

@Module({
  imports: [JwtModule],
  providers: [...HELPERS],
  exports: [...HELPERS],
})
export class HelpersModule {}
