import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UploadedFiles,
  UseInterceptors,
} from "@nestjs/common";
import { FilesInterceptor } from "@nestjs/platform-express";
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from "@nestjs/swagger";
import { ActiveUser } from "@src/app/decorators";
import { IActiveUser } from "@src/app/decorators/active-user.decorator";
import { IFileMeta } from "@src/app/interfaces";
import { SuccessResponse } from "@src/app/types";
import { storageImageOptions } from "@src/shared/file.constants";
import { FilterFiledDTO } from "../dtos";
import { UploadFileDto } from "../dtos/fileStorage/uploadFile.dto";
import { FileUploadService } from "../services/fileUpload.service";

@ApiTags("File Storage")
@ApiBearerAuth()
@Controller("files")
export class FileStorageController {
  constructor(private readonly fileUploadService: FileUploadService) { }

  @Get()
  async filterFiles(
    @Query() query: FilterFiledDTO,
    @ActiveUser() authUser: IActiveUser
  ) {
    return this.fileUploadService.filterFiles(query, authUser);
  }

  @Post()
  @ApiConsumes("multipart/form-data")
  @ApiBody({ type: UploadFileDto })
  @UseInterceptors(
    FilesInterceptor("files", 5, { storage: storageImageOptions })
  )
  async uploadImage(
    @UploadedFiles() files: IFileMeta[],
    @Body() body: UploadFileDto,
    @ActiveUser() authUser: IActiveUser
  ): Promise<SuccessResponse> {
    return this.fileUploadService.uploadImage(files, body, authUser);
  }

  @Delete(":id")
  async deleteOne(
    @Param("id") id: number,
    @ActiveUser() authUser: IActiveUser
  ): Promise<SuccessResponse> {
    return this.fileUploadService.deleteFile(id, authUser);
  }
}
