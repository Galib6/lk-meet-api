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
import { CreateExcaliFolderDTO } from "../dtos/excaliFolder/create.dto";
import { FilterExcaliFolderDTO } from "../dtos/excaliFolder/filter.dto";
import { UpdateExcaliFolderDTO } from "../dtos/excaliFolder/update.dto";
import { ExcaliFolder } from "../entities/excaliFolder.entity";
import { ExcaliFolderService } from "../services/excaliFolder.service";

@ApiTags("ExcaliFolders")
@ApiBearerAuth()
@Controller("internal/excali-folders")
export class InternalExcaliFolderController {
  constructor(private readonly service: ExcaliFolderService) { }

  @Get()
  async findAll(
    @Query() query: FilterExcaliFolderDTO,
    @ActiveUser() authUser: IActiveUser
  ): Promise<SuccessResponse> {
    return this.service.findAllForUser(query, authUser);
  }

  @Get(":id")
  async findById(
    @Param("id") id: number,
    @ActiveUser() authUser: IActiveUser
  ): Promise<ExcaliFolder> {
    return this.service.findByIdForUser(id, authUser);
  }

  @Post()
  async createOne(
    @Body() body: CreateExcaliFolderDTO,
    @ActiveUser() authUser: IActiveUser
  ): Promise<ExcaliFolder> {
    return this.service.createForUser(body, authUser);
  }

  @Patch(":id")
  async updateOne(
    @Param("id") id: number,
    @Body() body: UpdateExcaliFolderDTO,
    @ActiveUser() authUser: IActiveUser
  ): Promise<ExcaliFolder> {
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
