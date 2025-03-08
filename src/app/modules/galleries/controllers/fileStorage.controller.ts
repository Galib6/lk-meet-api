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
import { IFileMeta } from "@src/app/interfaces";
import { SuccessResponse } from "@src/app/types";
import { storageImageOptions } from "@src/shared/file.constants";
import { FilterFiledDTO } from "../dtos";
import { FileUploadService } from "../services/fileUpload.service";

@ApiTags("File Storage")
@ApiBearerAuth()
@Controller("files")
export class FileStorageController {
  constructor(private readonly fileUploadService: FileUploadService) {}

  @Get()
  async filterFiles(@Query() query: FilterFiledDTO) {
    return this.fileUploadService.filterFiles(query);
  }

  @Post()
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        files: {
          type: "array",
          items: {
            type: "string",
            format: "binary",
          },
        },
        folder: {
          type: "default",
        },
      },
    },
  })
  @UseInterceptors(
    FilesInterceptor("files", 5, { storage: storageImageOptions })
  )
  async uploadImage(
    @UploadedFiles() files: IFileMeta[],
    @Body() body: { folder: string }
  ): Promise<SuccessResponse> {
    return this.fileUploadService.uploadImage(files, body);
  }

  @Delete(":id")
  async deleteOne(@Param("id") id: number): Promise<SuccessResponse> {
    return this.fileUploadService.deleteFile(id);
  }
}
