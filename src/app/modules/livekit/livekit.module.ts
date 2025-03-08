import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { InternalLiveKitController } from "./controllers/livekit.internal.controller";
import { LiveKitService } from "./services/livekit.service";

const entities = [];
const services = [LiveKitService];
const subscribers = [];
const controllers = [InternalLiveKitController];
const modules = [];

@Module({
  imports: [...modules, TypeOrmModule.forFeature([...entities])],
  providers: [...services, ...subscribers],
  exports: [...services, ...subscribers],
  controllers: [...controllers],
})
export class LiveKitModule {}
