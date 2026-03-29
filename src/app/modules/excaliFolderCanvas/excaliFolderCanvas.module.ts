import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { InternalExcaliCanvasController } from "./controllers/excaliCanvas.internal.controller";
import { InternalExcaliFolderController } from "./controllers/excaliFolder.internal.controller";
import { ExcaliCanvas } from "./entities/excaliCanvas.entity";
import { ExcaliFolder } from "./entities/excaliFolder.entity";
import { ExcaliCanvasService } from "./services/excaliCanvas.service";
import { ExcaliFolderService } from "./services/excaliFolder.service";

const entities = [ExcaliFolder, ExcaliCanvas];
const services = [ExcaliFolderService, ExcaliCanvasService];
const subscribers = [];
const controllers = [];
const webControllers = [];
const internalControllers = [
  InternalExcaliFolderController,
  InternalExcaliCanvasController,
];

@Module({
  imports: [TypeOrmModule.forFeature(entities)],
  providers: [...services, ...subscribers],
  exports: [...services, ...subscribers],
  controllers: [...controllers, ...webControllers, ...internalControllers],
})
export class ExcaliFolderCanvasModule { }
