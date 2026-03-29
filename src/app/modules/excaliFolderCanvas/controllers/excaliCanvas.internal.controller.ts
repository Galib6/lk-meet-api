import {
  Body,
  Controller,
  Delete,
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
import { CreateExcaliCanvasDTO } from "../dtos/excaliCanvas/create.dto";
import { FilterExcaliCanvasDTO } from "../dtos/excaliCanvas/filter.dto";
import { UpdateExcaliCanvasDTO } from "../dtos/excaliCanvas/update.dto";
import { ExcaliCanvas } from "../entities/excaliCanvas.entity";
import { ExcaliCanvasService } from "../services/excaliCanvas.service";

@ApiTags("ExcaliCanvas")
@ApiBearerAuth()
@Controller("excali-canvas")
export class InternalExcaliCanvasController {
  constructor(private readonly service: ExcaliCanvasService) { }

  @Get()
  async findAll(
    @Query() query: FilterExcaliCanvasDTO,
    @ActiveUser() authUser: IActiveUser
  ): Promise<SuccessResponse> {
    return this.service.findAllForUser(query, authUser);
  }

  @Get(":id")
  async findById(
    @Param("id") id: number,
    @ActiveUser() authUser: IActiveUser
  ): Promise<ExcaliCanvas> {
    return this.service.findByIdForUser(id, authUser);
  }

  @Post()
  async createOne(
    @Body() body: CreateExcaliCanvasDTO,
    @ActiveUser() authUser: IActiveUser
  ): Promise<ExcaliCanvas> {
    return this.service.createForUser(body, authUser);
  }

  @Patch(":id")
  async updateOne(
    @Param("id") id: number,
    @Body() body: UpdateExcaliCanvasDTO,
    @ActiveUser() authUser: IActiveUser
  ): Promise<ExcaliCanvas> {
    return this.service.updateForUser(id, body, authUser);
  }

  @Delete(":id")
  async deleteOne(
    @Param("id") id: number,
    @ActiveUser() authUser: IActiveUser
  ): Promise<SuccessResponse> {
    return this.service.deleteForUser(id, authUser);
  }
}
