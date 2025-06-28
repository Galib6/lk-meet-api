import { Inject, Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { ClientKafka } from "@nestjs/microservices";

export interface IKafkaMessage {
  key?: string;
  value: any;
  headers?: Record<string, string>;
  partition?: number;
  timestamp?: string;
}

export interface ITopicConfig {
  topic: string;
  numPartitions?: number;
  replicationFactor?: number;
  configEntries?: Array<{ name: string; value: string }>;
}

export interface ITopicMetadata {
  name: string;
  partitions: Array<{
    partitionId: number;
    leader: number;
    replicas: number[];
    isr: number[];
  }>;
}

@Injectable()
export class KafkaService implements OnModuleInit {
  private readonly logger = new Logger(KafkaService.name);

  constructor(@Inject("KAFKA_CLIENT") private readonly client: ClientKafka) {}

  async onModuleInit() {
    try {
      await this.client.connect();
      this.logger.log("Kafka client connected successfully");
    } catch (error) {
      this.logger.error("Failed to connect to Kafka", error);
    }
  }

  async emit(topic: string, message: IKafkaMessage): Promise<boolean> {
    try {
      const payload = {
        key: message.key,
        value: JSON.stringify(message.value),
        headers: message.headers,
        partition: message.partition,
        timestamp: message.timestamp,
      };

      await this.client.emit(topic, payload);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send message to topic '${topic}'`, error);
      return false;
    }
  }

  async send<T = any>(pattern: string, data: any): Promise<T> {
    try {
      const response = await this.client.send(pattern, data).toPromise();
      return response;
    } catch (error) {
      this.logger.error(
        `Failed to send request for pattern '${pattern}'`,
        error
      );
      throw error;
    }
  }

  async bulkEmit(
    messages: Array<{ topic: string; message: IKafkaMessage }>
  ): Promise<boolean[]> {
    return Promise.all(
      messages.map(({ topic, message }) => this.emit(topic, message))
    );
  }

  async registerTopics(topics: ITopicConfig[]): Promise<boolean[]> {
    const results: boolean[] = [];

    for (const topicConfig of topics) {
      try {
        // Use the client's internal admin for topic creation
        const admin = (this.client as any).client?.admin?.();
        if (admin) {
          await admin.createTopics({
            topics: [
              {
                topic: topicConfig.topic,
                numPartitions: topicConfig.numPartitions || 1,
                replicationFactor: topicConfig.replicationFactor || 1,
                configEntries: topicConfig.configEntries || [],
              },
            ],
          });
          this.logger.log(
            `Topic '${topicConfig.topic}' registered successfully`
          );
          results.push(true);
        } else {
          this.logger.error(
            `Admin client not available for topic '${topicConfig.topic}'`
          );
          results.push(false);
        }
      } catch (error) {
        this.logger.error(
          `Failed to register topic '${topicConfig.topic}'`,
          error
        );
        results.push(false);
      }
    }

    return results;
  }

  async getTopicMetadata(topic: string): Promise<ITopicMetadata | null> {
    try {
      const admin = (this.client as any).client?.admin?.();
      if (!admin) {
        this.logger.error("Admin client not available for metadata retrieval");
        return null;
      }

      const metadata = await admin.fetchTopicMetadata({ topics: [topic] });
      const topicMetadata = metadata.topics.find((t) => t.name === topic);

      if (!topicMetadata) {
        this.logger.warn(`Topic '${topic}' not found`);
        return null;
      }

      return {
        name: topicMetadata.name,
        partitions: topicMetadata.partitions.map((p) => ({
          partitionId: p.partitionId,
          leader: p.leader,
          replicas: p.replicas,
          isr: p.isr,
        })),
      };
    } catch (error) {
      this.logger.error(`Failed to get metadata for topic '${topic}'`, error);
      return null;
    }
  }

  async listTopics(): Promise<string[]> {
    try {
      const admin = (this.client as any).client?.admin?.();
      if (!admin) {
        this.logger.error("Admin client not available for topic listing");
        return [];
      }

      const metadata = await admin.fetchTopicMetadata({});
      const topics = metadata.topics.map((topic) => topic.name);

      this.logger.log(`Found ${topics.length} topics`);
      return topics;
    } catch (error) {
      this.logger.error("Failed to list topics", error);
      return [];
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.emit("system.health", {
        key: "health-check",
        value: {
          timestamp: new Date().toISOString(),
          service: "kafka-service",
          status: "healthy",
        },
      });
      return true;
    } catch (error) {
      this.logger.error("Kafka health check failed", error);
      return false;
    }
  }

  async onApplicationShutdown() {
    try {
      await this.client.close();
      this.logger.log("Kafka client closed");
    } catch (error) {
      this.logger.error("Error during Kafka cleanup", error);
    }
  }
}
