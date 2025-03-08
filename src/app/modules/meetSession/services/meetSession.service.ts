import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { BaseService } from "@src/app/base/base.service";
import { IActiveUser } from "@src/app/decorators/active-user.decorator";
import { SuccessResponse } from "@src/app/types";
import { asyncForEach } from "@src/shared";
import { Repository } from "typeorm";
import { LiveKitService } from "../../livekit/services/livekit.service";
import {
  CONNECTION_DETAILS,
  NEW_REQUEST,
} from "../../socket/gateways/constants";
import { MeetingSessionGateway } from "../../socket/gateways/meetingSession.gateway";
import { ChangeRequestStatusDTO } from "../dtos/acceptRequest.dto";
import { CreateMeetingSessionDTO } from "../dtos/create.dto";
import { MeetingSession } from "../entities/meetSession.entity";
import { ENUM_MEETING_ENTRY_APPROVAL_STATUS } from "../enums";
import { MeetingSessionUserService } from "./meetSessionUser.service";

@Injectable()
export class MeetingSessionService extends BaseService<MeetingSession> {
  constructor(
    @InjectRepository(MeetingSession)
    public readonly _repo: Repository<MeetingSession>,
    // private readonly dataSource: DataSource
    private readonly meetingSessionUserService: MeetingSessionUserService,
    private readonly meetingSessionGateway: MeetingSessionGateway,
    private readonly liveKitService: LiveKitService
  ) {
    super(_repo);
  }

  async createSession(body: CreateMeetingSessionDTO, authUser: IActiveUser) {
    const newRoom = await this.createOneBase({
      roomName: this.generateMetingRoomName(),
      createdBy: {
        id: authUser?.id,
      },
      sessionType: body?.sessionType,
    });

    const connectionDetails = await this.liveKitService.getConnectionDetails({
      identity: crypto.randomUUID(),
      roomName: newRoom?.roomName,
      participantName: authUser?.name,
    });
    await this.meetingSessionGateway.sendDataToSingleUser(
      authUser?.id,
      CONNECTION_DETAILS,
      connectionDetails
    );
    return new SuccessResponse("");
  }

  async RequestSessionDetails(roomName: string, authUser: IActiveUser) {
    const meetingSession = await this.findOne({
      where: { roomName },
      relations: ["createdBy"],
    });

    if (!meetingSession?.id) throw new NotFoundException("room not found");
    if (meetingSession.sessionEnded)
      throw new BadRequestException("meeting already ended");

    const getConnectionDetailsAndSend = async () => {
      const details = await this.liveKitService.getConnectionDetails({
        roomName,
        identity: crypto.randomUUID(),
        participantName: authUser?.name,
      });

      await this.meetingSessionGateway.sendDataToSingleUser(
        authUser?.id,
        CONNECTION_DETAILS,
        details
      );
    };

    if (authUser?.id === meetingSession?.createdBy?.id) {
      await getConnectionDetailsAndSend();
      return new SuccessResponse("");
    }

    const userStatus = await this.meetingSessionUserService.findOne({
      where: { user: { id: authUser?.id } },
      relations: ["createdBy"],
    });

    if (userStatus?.id) {
      switch (userStatus.approvalType) {
        case ENUM_MEETING_ENTRY_APPROVAL_STATUS.rejected:
          throw new BadRequestException("Not Allowed");
        case ENUM_MEETING_ENTRY_APPROVAL_STATUS.pending:
          throw new BadRequestException("wait for admin acceptance");
        case ENUM_MEETING_ENTRY_APPROVAL_STATUS.approved:
          await getConnectionDetailsAndSend();
          return new SuccessResponse("");
      }
    }

    await this.meetingSessionUserService.createOneBase({
      approvalType: ENUM_MEETING_ENTRY_APPROVAL_STATUS.pending,
      user: { id: authUser?.id },
      meetingSession: { id: meetingSession?.id },
    });

    await this.meetingSessionGateway.sendDataToSingleUser(
      meetingSession?.createdBy?.id,
      NEW_REQUEST,
      { type: "New enter request arrived" }
    );

    return new SuccessResponse("");
  }

  async ChangeRequestStatus(
    body: ChangeRequestStatusDTO,
    authUser: IActiveUser
  ) {
    const meetingSession = await this.findOne({
      where: { roomName: body?.roomName },
      relations: ["createdBy"],
    });

    if (authUser?.id !== meetingSession?.createdBy?.id)
      throw new UnauthorizedException();

    if (!meetingSession?.roomName)
      throw new NotFoundException("room not found");

    asyncForEach(body.requestsIds, async (user) => {
      const isExists = await this.meetingSessionUserService.findOneBase({
        meetingSession: {
          id: meetingSession?.id,
        },
        user: {
          id: user,
        },
        approvalType: ENUM_MEETING_ENTRY_APPROVAL_STATUS.approved,
      });

      if (!isExists) throw new NotFoundException("");

      await this.meetingSessionUserService.updateOneBase(isExists?.id, {
        approvalType: body?.status,
      });

      const details = await this.liveKitService.getConnectionDetails({
        roomName: meetingSession?.roomName,
        identity: crypto.randomUUID(),
        participantName: authUser?.name,
      });

      await this.meetingSessionGateway.sendDataToSingleUser(
        user,
        CONNECTION_DETAILS,
        details
      );
    });
  }

  async getPendingRequest(roomName: string) {
    return await this.meetingSessionUserService.find({
      where: {
        meetingSession: {
          roomName: roomName,
        },
        approvalType: ENUM_MEETING_ENTRY_APPROVAL_STATUS.pending,
      },
      relations: ["meetingSession"],
    });
  }

  generateMetingRoomName(): string {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < 14; i++) {
      if (i === 7) {
        result += "-";
      }
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}
