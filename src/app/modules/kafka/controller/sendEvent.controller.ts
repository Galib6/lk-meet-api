import { Controller, Get, Post } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { Auth } from "@src/app/decorators";
import { AuthType } from "@src/app/enums/auth-type.enum";
import { SuccessResponse } from "@src/app/types";
import { KafkaAdminService } from "../kafka.admin";
import { KafkaService } from "../kafka.service";
import { KAFKA_TOPICS } from "../topics/kafka.types";

@ApiTags("Kafka")
@ApiBearerAuth()
@Controller("kafka")
@Auth(AuthType.None)
export class KafkaSendEventController {
  constructor(
    private readonly service: KafkaService,
    private readonly adminService: KafkaAdminService
  ) {}

  @Get()
  async sendUserEvent(): Promise<SuccessResponse> {
    const userEvent: any = {
      id: "user-123",
      action: "login",
      timestamp: new Date().toISOString(),
      data: {
        deviceType: "web",
        ipAddress: "192.168.1.1",
        location: "New York, NY",
      },
    };
    const success = await this.service.emit(KAFKA_TOPICS.USER_EVENTS, {
      key: "dddsdf",
      value: userEvent,
    });

    return new SuccessResponse(
      success ? "User event sent successfully" : "Failed to send user event",
      {
        eventSent: success,
        eventData: userEvent,
      }
    );
  }

  @Post("create-topics")
  async createTopics(): Promise<SuccessResponse> {
    try {
      await this.adminService.createTopicsIfNotExist();
      return new SuccessResponse("Topics created successfully");
    } catch (error) {
      return new SuccessResponse("Failed to create topics", {
        error: error.message,
      });
    }
  }

  @Get("topics")
  async getTopics(): Promise<SuccessResponse> {
    const topics = Object.values(KAFKA_TOPICS);
    return new SuccessResponse("Available Kafka topics", {
      topics,
      totalCount: topics.length,
    });
  }
}
