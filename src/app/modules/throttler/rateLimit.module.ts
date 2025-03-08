import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { ENV } from "@src/env";

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: ENV.rateLimit.rateLimitTTL,
        limit: ENV.rateLimit.rateLimitMax,
      },
    ]),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class RateLimitModule {}
