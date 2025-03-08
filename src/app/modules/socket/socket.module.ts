import { Global, Module } from "@nestjs/common";
import { MeetingSessionGateway } from "./gateways/meetingSession.gateway";
import { SharedModule } from "./shared/shared.module";

const GATEWAYS = [MeetingSessionGateway];
@Global()
@Module({
  imports: [SharedModule],
  providers: [...GATEWAYS],
  exports: [...GATEWAYS],
})
export class SocketModule {}
