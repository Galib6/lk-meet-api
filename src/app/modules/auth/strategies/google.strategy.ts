import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ENV } from "@src/env";
import { GOOGLE_STRATEGY } from "@src/shared/strategy/strategy.constants";
import { Strategy, VerifyCallback } from "passport-google-oauth20";

@Injectable()
export class GoogleStrategy extends PassportStrategy(
  Strategy,
  GOOGLE_STRATEGY
) {
  constructor() {
    super({
      clientID: ENV.google.clientId,
      clientSecret: ENV.google.secret,
      callbackURL: ENV.google.redirectUrl,
      scope: ["email", "profile"],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback
  ): Promise<any> {
    const { id, name, emails, photos } = profile;

    const user = {
      providerIdentifier: id,
      email: emails[0].value,
      firstName: name.givenName,
      lastName: name.familyName,
      picture: photos[0].value,
      accessToken,
      refreshToken,
    };

    done(null, user);
  }
}
