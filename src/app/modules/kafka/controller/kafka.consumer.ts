import { Controller } from "@nestjs/common";
import {
  Ctx,
  EventPattern,
  KafkaContext,
  Payload,
} from "@nestjs/microservices";
import { KAFKA_TOPICS } from "../topics/kafka.types";

@Controller()
export class KafkaConsumer {
  @EventPattern(KAFKA_TOPICS.USER_EVENTS)
  async handleUserEvent(@Payload() data: any, @Ctx() context: KafkaContext) {
    console.log("🚀😬 ~ KafkaConsumer ~ data:", data, context);
  }
}
