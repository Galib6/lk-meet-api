import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { ENV } from "@src/env";
import { Admin, Kafka } from "kafkajs";
import { KAFKA_TOPICS } from "./topics/kafka.types";

export interface ITopicConfig {
  topic: string;
  numPartitions?: number;
  replicationFactor?: number;
  configEntries?: Array<{ name: string; value: string }>;
}

@Injectable()
export class KafkaAdminService implements OnModuleInit {
  private readonly logger = new Logger(KafkaAdminService.name);
  private admin: Admin;
  private kafka: Kafka;

  constructor() {
    this.kafka = new Kafka({
      clientId: ENV.kafka.clientId,
      brokers: [ENV.kafka.kafkaBroker],
      ...(ENV.kafka.username &&
        ENV.kafka.password && {
          sasl: {
            mechanism: ENV.kafka.saslMechanism as any,
            username: ENV.kafka.username,
            password: ENV.kafka.password,
          },
        }),
    });
    this.admin = this.kafka.admin();
  }

  async onModuleInit() {
    if (ENV.kafka.enabled === "true") {
      await this.createTopicsIfNotExist();
    }
  }

  private getTopicConfigurations(): ITopicConfig[] {
    return [
      {
        topic: KAFKA_TOPICS.USER_EVENTS,
        numPartitions: 3,
        replicationFactor: 1,
        configEntries: [
          { name: "retention.ms", value: "604800000" }, // 7 days
          { name: "cleanup.policy", value: "delete" },
          { name: "compression.type", value: "snappy" },
        ],
      },
      {
        topic: KAFKA_TOPICS.MEETING_EVENTS,
        numPartitions: 3,
        replicationFactor: 1,
        configEntries: [
          { name: "retention.ms", value: "604800000" }, // 7 days
          { name: "cleanup.policy", value: "delete" },
          { name: "compression.type", value: "snappy" },
        ],
      },
      {
        topic: KAFKA_TOPICS.NOTIFICATION_EVENTS,
        numPartitions: 2,
        replicationFactor: 1,
        configEntries: [
          { name: "retention.ms", value: "259200000" }, // 3 days
          { name: "cleanup.policy", value: "delete" },
        ],
      },
      {
        topic: KAFKA_TOPICS.SYSTEM_HEALTH,
        numPartitions: 1,
        replicationFactor: 1,
        configEntries: [
          { name: "retention.ms", value: "86400000" }, // 1 day
          { name: "cleanup.policy", value: "delete" },
        ],
      },
    ];
  }

  async createTopicsIfNotExist(): Promise<void> {
    try {
      await this.admin.connect();
      this.logger.log("Connected to Kafka admin client");

      const existingTopics = await this.admin.listTopics();
      this.logger.log(`Existing topics: ${existingTopics.join(", ")}`);

      const topicConfigs = this.getTopicConfigurations();
      const topicsToCreate = topicConfigs.filter(
        (config) => !existingTopics.includes(config.topic)
      );

      if (topicsToCreate.length > 0) {
        this.logger.log(
          `Creating topics: ${topicsToCreate.map((t) => t.topic).join(", ")}`
        );

        await this.admin.createTopics({
          topics: topicsToCreate.map((config) => ({
            topic: config.topic,
            numPartitions: config.numPartitions || 1,
            replicationFactor: config.replicationFactor || 1,
            configEntries: config.configEntries || [],
          })),
          validateOnly: false,
          waitForLeaders: true,
          timeout: 30000,
        });

        this.logger.log(
          `Successfully created topics: ${topicsToCreate.map((t) => t.topic).join(", ")}`
        );
      } else {
        this.logger.log("All required topics already exist");
      }

      // List topics again to verify creation
      const updatedTopics = await this.admin.listTopics();
      this.logger.log(`All topics after creation: ${updatedTopics.join(", ")}`);
    } catch (error) {
      this.logger.error("Error managing Kafka topics:", error);
      throw error;
    } finally {
      await this.admin.disconnect();
      this.logger.log("Disconnected from Kafka admin client");
    }
  }

  async createTopic(config: ITopicConfig): Promise<boolean> {
    try {
      await this.admin.connect();

      const existingTopics = await this.admin.listTopics();
      if (existingTopics.includes(config.topic)) {
        this.logger.log(`Topic ${config.topic} already exists`);
        return true;
      }

      await this.admin.createTopics({
        topics: [
          {
            topic: config.topic,
            numPartitions: config.numPartitions || 1,
            replicationFactor: config.replicationFactor || 1,
            configEntries: config.configEntries || [],
          },
        ],
      });

      this.logger.log(`Successfully created topic: ${config.topic}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to create topic ${config.topic}:`, error);
      return false;
    } finally {
      await this.admin.disconnect();
    }
  }

  async deleteTopic(topicName: string): Promise<boolean> {
    try {
      await this.admin.connect();

      await this.admin.deleteTopics({
        topics: [topicName],
        timeout: 30000,
      });

      this.logger.log(`Successfully deleted topic: ${topicName}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to delete topic ${topicName}:`, error);
      return false;
    } finally {
      await this.admin.disconnect();
    }
  }

  async getTopicMetadata(topicName: string): Promise<any> {
    try {
      await this.admin.connect();

      const metadata = await this.admin.fetchTopicMetadata({
        topics: [topicName],
      });

      return metadata.topics[0];
    } catch (error) {
      this.logger.error(
        `Failed to get metadata for topic ${topicName}:`,
        error
      );
      return null;
    } finally {
      await this.admin.disconnect();
    }
  }
}
