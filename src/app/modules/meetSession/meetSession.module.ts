import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { LiveKitModule } from "../livekit/livekit.module";
import { SocketModule } from "../socket/socket.module";
import { InternalMeetingSessionController } from "./controllers/internal/meetSession.internal.controller";
import { MeetingSession } from "./entities/meetSession.entity";
import { MeetingSessionUser } from "./entities/meetingSessionUser.entity";
import { MeetingSessionService } from "./services/meetSession.service";
import { MeetingSessionUserService } from "./services/meetSessionUser.service";

const entities = [MeetingSession, MeetingSessionUser];
const services = [MeetingSessionService, MeetingSessionUserService];
const subscribers = [];
const controllers = [];
const webControllers = [];
const internalControllers = [InternalMeetingSessionController];
const modules = [SocketModule, LiveKitModule];

@Module({
  imports: [TypeOrmModule.forFeature(entities), ...modules],
  providers: [...services, ...subscribers],
  exports: [...services, ...subscribers],
  controllers: [...controllers, ...webControllers, ...internalControllers],
})
export class MeetingSessionModule {}
