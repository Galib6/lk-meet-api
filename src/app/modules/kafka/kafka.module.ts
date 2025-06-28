import { Logger, Module, OnModuleInit } from "@nestjs/common";
import { ClientsModule } from "@nestjs/microservices";
import { KafkaFactory } from "./config/kafka.factory";
import { KafkaConsumer } from "./controller/kafka.consumer";
import { KafkaSendEventController } from "./controller/sendEvent.controller";
import { KafkaAdminService } from "./kafka.admin";
import { KafkaService } from "./kafka.service";

@Module({
  imports: [
    ...(KafkaFactory.isEnabled()
      ? [
          ClientsModule.register([
            {
              name: "KAFKA_CLIENT",
              ...KafkaFactory.createClientOptions(),
            },
          ]),
        ]
      : []),
  ],
  providers: [
    ...(KafkaFactory.isEnabled() ? [KafkaService, KafkaAdminService] : []),
  ],
  controllers: [KafkaSendEventController, KafkaConsumer],
  exports: [
    ...(KafkaFactory.isEnabled() ? [KafkaService, KafkaAdminService] : []),
  ],
})
export class KafkaModule implements OnModuleInit {
  private readonly logger = new Logger(KafkaModule.name);
  constructor(private readonly adminService?: KafkaAdminService) {}

  async onModuleInit() {
    if (KafkaFactory.isEnabled()) {
      if (this.adminService) {
        try {
          await this.adminService.createTopicsIfNotExist();
          this.logger.log("✅ Kafka topics creation process completed");
        } catch (error) {
          this.logger.error("❌ Failed to create Kafka topics:", error);
        }
      } else {
        this.logger.warn("⚠️ Kafka admin service not available");
      }
    } else {
      this.logger.log("⚠️ Kafka module disabled");
    }
  }
}
