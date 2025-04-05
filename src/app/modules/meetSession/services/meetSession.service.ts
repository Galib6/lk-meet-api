import {
  BadRequestException,
  Injectable,
  NotAcceptableException,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { InjectRepository } from "@nestjs/typeorm";
import { BaseService } from "@src/app/base/base.service";
import { IActiveUser } from "@src/app/decorators/active-user.decorator";
import { SuccessResponse } from "@src/app/types";
import { randomString } from "@src/shared";
import { In, Not, Repository } from "typeorm";
import { LiveKitService } from "../../livekit/services/livekit.service";
import {
  CONNECTION_DETAILS,
  NEW_REQUEST,
  REQ_REJECTED,
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

  @Cron("0 * * * * *")
  async handleExpiredSessions() {
    const roomList = await this.liveKitService.listRooms();
    try {
      await this.repo.update(
        {
          roomName: Not(In(roomList)),
        },
        {
          sessionEnded: true,
        }
      );
    } catch (error) {
      console.log(
        "🚀😬 ~ MeetingSessionService ~ handleExpiredSessions ~ error:",
        error
      );
    }
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
      identity: randomString(5),
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

  async RequestOnHold(roomName: string, authUser: IActiveUser) {
    const meetingSession = await this.findOne({
      where: { roomName },
      relations: ["createdBy"],
    });

    if (!meetingSession?.id)
      throw new NotFoundException("Meeting session not found");
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
        {
          ...details,
        }
      );
    };

    if (authUser?.id === meetingSession?.createdBy?.id) {
      await getConnectionDetailsAndSend();
      return {
        userType: "admin",
      };
    }

    const userStatus = await this.meetingSessionUserService.findOne({
      where: {
        user: { id: authUser?.id },
        meetingSession: {
          roomName: roomName,
        },
      },
      relations: ["createdBy", "meetingSession"],
    });

    if (userStatus?.id) {
      switch (userStatus.approvalType) {
        case ENUM_MEETING_ENTRY_APPROVAL_STATUS.rejected:
          throw new NotAcceptableException(
            "You are not allowed to this meeting session, Please contact with admin!"
          );
        case ENUM_MEETING_ENTRY_APPROVAL_STATUS.onHold:
          return {
            userType: "participant",
          };
        case ENUM_MEETING_ENTRY_APPROVAL_STATUS.pending:
          await this.meetingSessionGateway.sendDataToSingleUser(
            meetingSession?.createdBy?.id,
            NEW_REQUEST,
            {
              message: "New enter request arrived",
              name: authUser?.name,
              id: authUser?.id,
            }
          );
          throw new BadRequestException("Please wait for admin acceptance");
        case ENUM_MEETING_ENTRY_APPROVAL_STATUS.approved:
          await getConnectionDetailsAndSend();
          return {
            userType: "participant",
          };
      }
    }

    await this.meetingSessionUserService.createOneBase({
      approvalType: ENUM_MEETING_ENTRY_APPROVAL_STATUS.onHold,
      user: { id: authUser?.id },
      meetingSession: { id: meetingSession?.id },
    });

    // await this.meetingSessionGateway.sendDataToSingleUser(
    //   meetingSession?.createdBy?.id,
    //   NEW_REQUEST,
    //   {
    //     type: "New enter request arrived",
    //     name: authUser?.name,
    //     id: authUser?.id,
    //   }
    // );

    return {
      userType: "participant",
    };
  }
  async muteAllParticipants(roomName: string): Promise<void> {
    return await this.liveKitService.muteAllParticipants(roomName);
  }

  async findRequestSendStatus(roomName: string, authUser: IActiveUser) {
    const res = await this.meetingSessionUserService.findOne({
      where: {
        meetingSession: {
          roomName: roomName,
        },
        user: {
          id: authUser?.id,
        },
        approvalType: ENUM_MEETING_ENTRY_APPROVAL_STATUS.pending,
      },
    });

    return {
      sent: res?.id ? true : false,
    };
  }

  async findParticipantList(roomName: string, authUser: IActiveUser) {
    const meetingSession = await this.findOne({
      where: { roomName },
      relations: ["createdBy"],
    });

    if (!meetingSession?.id)
      throw new NotFoundException("Meeting session not found");
    if (meetingSession.sessionEnded)
      throw new BadRequestException("meeting already ended");
    return await this.liveKitService.listParticipants(roomName);
  }

  async sendJoinRequest(roomName: string, authUser: IActiveUser) {
    const meetingSession = await this.findOne({
      where: { roomName },
      relations: ["createdBy"],
    });

    if (!meetingSession?.id)
      throw new NotFoundException("Meeting session not found");
    if (meetingSession.sessionEnded)
      throw new BadRequestException("meeting already ended");

    const meetingSessionUser = await this.meetingSessionUserService.findOne({
      where: {
        meetingSession: {
          id: meetingSession?.id,
        },
        user: {
          id: authUser?.id,
        },
      },
    });

    await this.meetingSessionUserService.updateOneBase(meetingSessionUser?.id, {
      approvalType: ENUM_MEETING_ENTRY_APPROVAL_STATUS.pending,
      user: { id: authUser?.id },
      meetingSession: { id: meetingSession?.id },
    });

    await this.meetingSessionGateway.sendDataToSingleUser(
      meetingSession?.createdBy?.id,
      NEW_REQUEST,
      {
        type: "New enter request arrived",
        name: authUser?.name,
        id: authUser?.id,
      }
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
      throw new NotFoundException("Meeting session not found");

    try {
      for (const user of body.requestsIds) {
        const isExists = await this.meetingSessionUserService.findOne({
          where: {
            meetingSession: {
              id: meetingSession?.id,
            },
            user: {
              id: user,
            },
          },
          relations: ["meetingSession", "user"],
        });

        if (!isExists) {
          throw new NotFoundException(
            `User request not found for user ID: ${user}`
          );
        }

        await this.meetingSessionUserService.updateOneBase(isExists?.id, {
          approvalType: body?.status,
        });

        if (body.status === ENUM_MEETING_ENTRY_APPROVAL_STATUS.approved) {
          const details = await this.liveKitService.getConnectionDetails({
            roomName: meetingSession?.roomName,
            identity: crypto.randomUUID(),
            participantName: `${isExists?.user?.firstName} ${isExists?.user?.lastName}`,
          });

          await this.meetingSessionGateway.sendDataToSingleUser(
            user,
            CONNECTION_DETAILS,
            details
          );
        }
        if (body.status === ENUM_MEETING_ENTRY_APPROVAL_STATUS.rejected) {
          await this.meetingSessionGateway.sendDataToSingleUser(
            user,
            REQ_REJECTED,
            { message: "Request Rejected!" }
          );
        }
      }

      return new SuccessResponse("Request status updated successfully");
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(
        error?.message || "Failed to process request status changes"
      );
    }
  }

  async getPendingRequest(roomName: string) {
    return await this.meetingSessionUserService.find({
      where: {
        meetingSession: {
          roomName: roomName,
        },
        approvalType: ENUM_MEETING_ENTRY_APPROVAL_STATUS.pending,
      },
      relations: ["meetingSession", "user"],
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
