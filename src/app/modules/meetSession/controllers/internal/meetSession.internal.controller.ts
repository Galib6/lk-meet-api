import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";

import { ActiveUser } from "@src/app/decorators";
import { IActiveUser } from "@src/app/decorators/active-user.decorator";
import { SuccessResponse } from "@src/app/types";
import { ChangeRequestStatusDTO } from "../../dtos/acceptRequest.dto";
import {
  CreateMeetingSessionDTO,
  RequestMeetingSessionDTO,
} from "../../dtos/create.dto";
import { UpdateMeetingSessionDTO } from "../../dtos/update.dto";
import { MeetingSession } from "../../entities/meetSession.entity";
import { MeetingSessionService } from "../../services/meetSession.service";

@ApiTags("MeetingSessions")
@ApiBearerAuth()
// @Auth(AuthType.None)
@Controller("internal/meeting-sessions")
export class InternalMeetingSessionController {
  RELATIONS = [];

  constructor(private readonly service: MeetingSessionService) {}

  // @Get()
  // async findAll(
  //   @Query() query: FilterMeetingSessionDTO
  // ): Promise<SuccessResponse | MeetingSession[]> {
  //   return this.service.findAllBase(query, { relations: this.RELATIONS });
  // }

  // @Get(":id")
  // async findById(@Param("id") id: number): Promise<MeetingSession> {
  //   return this.service.findByIdBase(id, { relations: this.RELATIONS });
  // }

  @Get("/request-list")
  async findAll(
    @Query() roomName: string
  ): Promise<SuccessResponse | MeetingSession[]> {
    return await this.service.getPendingRequest(roomName);
  }

  @Post("create")
  async createOne(
    @Body() body: CreateMeetingSessionDTO,
    @ActiveUser() authUser: IActiveUser
  ): Promise<SuccessResponse> {
    return await this.service.createSession(body, authUser);
  }

  @Patch(":id")
  async updateOne(
    @Param("id") id: number,
    @Body() body: UpdateMeetingSessionDTO
  ): Promise<MeetingSession> {
    return this.service.updateOneBase(id, body, { relations: this.RELATIONS });
  }

  @Post("/request")
  async findById(
    @Body() requestMeetingSessionDTO: RequestMeetingSessionDTO,
    @ActiveUser() authUser: IActiveUser
  ): Promise<SuccessResponse | any> {
    return await this.service.RequestSessionDetails(
      requestMeetingSessionDTO?.roomName,
      authUser
    );
  }

  @Post("/change-request-status")
  async acceptRequest(
    @Body() changeRequestStatusDTO: ChangeRequestStatusDTO,
    @ActiveUser() authUser: IActiveUser
  ): Promise<SuccessResponse | any> {
    return await this.service.ChangeRequestStatus(
      changeRequestStatusDTO,
      authUser
    );
  }

  // @Delete(":id")
  // async deleteOne(@Param("id") id: number): Promise<SuccessResponse> {
  //   return this.service.softDeleteOneBase(id);
  // }
}
