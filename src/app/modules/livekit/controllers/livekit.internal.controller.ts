import { Controller } from "@nestjs/common";
import { ApiBearerAuth } from "@nestjs/swagger";
import { LiveKitService } from "../services/livekit.service";

// @ApiTags("LiveKit")
@ApiBearerAuth()
@Controller("internal/meeting")
export class InternalLiveKitController {
  constructor(private readonly liveKitService: LiveKitService) {}

  // @Post("create-room")
  // async createRoom(@Body() payload: CreateRoomDTO) {
  //   await this.liveKitService.createRoom(payload?.name);
  //   return { message: `Room "${payload?.name}" created successfully.` };
  // }

  // @Post("join-room")
  // async joinRoom(@Body() payload: JoinRoomDTO) {
  //   return await this.liveKitService.generateToken(
  //     payload?.identity,
  //     payload?.roomName
  //   );
  // }

  // @Get("list-rooms")
  // async listRooms() {
  //   const rooms = await this.liveKitService.listRooms();
  //   return { rooms };
  // }

  // @Get("room-participants")
  // async percipientList(@Query("room") room: string) {
  //   return await this.liveKitService.listParticipants(room);
  // }

  // @Post("connection-details")
  // async connectionDetails(
  //   @Body() body: GetConnectionDetailsDTO,
  //   @ActiveUser() authUser: IActiveUser
  // ) {
  //   return await this.liveKitService.getConnectionDetails(body, authUser);
  // }

  // @Delete("delete-room")
  // async deleteRoom(@Query("name") name: string) {
  //   await this.liveKitService.deleteRoom(name);
  //   return { message: `Room "${name}" deleted successfully.` };
  // }
}
