import {
  ClientOptions,
  MicroserviceOptions,
  Transport,
} from "@nestjs/microservices";
import { ENV } from "@src/env";
import { Partitioners } from "kafkajs";

export class KafkaFactory {
  static isEnabled(): boolean {
    return ENV.kafka.enabled === "true";
  }

  private static createKafkaOptions() {
    const baseClientId = ENV.kafka.clientId;
    const uniqueId = Math.random().toString(36).substring(7);

    return {
      client: {
        clientId: `${baseClientId}-${uniqueId}`,
        brokers: [ENV.kafka.kafkaBroker],
        requestTimeout: 30000,
        connectionTimeout: 10000,
        ...(ENV.kafka.username &&
          ENV.kafka.password && {
            sasl: {
              mechanism: ENV.kafka.saslMechanism,
              username: ENV.kafka.username,
              password: ENV.kafka.password,
            },
          }),
      },
      consumer: {
        groupId: ENV.kafka.groupId,
        allowAutoTopicCreation: true,
        fromBeginning: true, // Start from latest to avoid old messages
        retry: {
          initialRetryTime: 100,
          retries: 8,
        },
      },
      producer: {
        allowAutoTopicCreation: true,
        createPartitioner: Partitioners.DefaultPartitioner,
        retry: {
          initialRetryTime: 100,
          retries: 3,
        },
      },
    };
  }

  static createClientOptions(): ClientOptions {
    return {
      transport: Transport.KAFKA,
      options: this.createKafkaOptions(),
    };
  }

  static createMicroserviceOptions(): MicroserviceOptions | null {
    if (!this.isEnabled()) {
      return null;
    }

    return {
      transport: Transport.KAFKA,
      options: this.createKafkaOptions(),
    };
  }
}
