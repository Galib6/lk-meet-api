import { BullModule } from "@nestjs/bullmq";
import { Module } from "@nestjs/common";
import { ENV } from "@src/env";

import { queuesConstants } from "./constants";
import { CountryPurVisaCatServiceDocProcessor } from "./processors/example.processor";
import { QueueService } from "./services/queue.service";

const processors = [CountryPurVisaCatServiceDocProcessor];
const service = [QueueService];
const modules = [];

const defaultJobOptions = {
  attempts: 5, // Number of retry attempts
  backoff: {
    type: "exponential", // every retries it will wait exponential at delay time
    delay: 5000, // Delay in milliseconds
  },
};

@Module({
  imports: [
    ...modules,
    BullModule.forRoot({
      connection: {
        host: ENV.redis.host,
        username: ENV.redis.username,
        password: ENV.redis.password,
        port: ENV.redis.port,
      },
    }),
    BullModule.registerQueue({
      name: queuesConstants.defaultQueue.name,
      defaultJobOptions,
    }),
  ],
  providers: [...service, ...processors],
  exports: [...service],
})
export class QueueModule {}
