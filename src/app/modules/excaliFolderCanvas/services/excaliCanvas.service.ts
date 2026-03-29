import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { BaseService } from "@src/app/base/base.service";
import { IActiveUser } from "@src/app/decorators/active-user.decorator";
import { SuccessResponse } from "@src/app/types";
import { Repository } from "typeorm";
import { CreateExcaliCanvasDTO } from "../dtos/excaliCanvas/create.dto";
import { FilterExcaliCanvasDTO } from "../dtos/excaliCanvas/filter.dto";
import { UpdateExcaliCanvasDTO } from "../dtos/excaliCanvas/update.dto";
import { ExcaliCanvas } from "../entities/excaliCanvas.entity";
import { ExcaliFolderService } from "./excaliFolder.service";

@Injectable()
export class ExcaliCanvasService extends BaseService<ExcaliCanvas> {
  constructor(
    @InjectRepository(ExcaliCanvas)
    public readonly _repo: Repository<ExcaliCanvas>,
    private readonly excaliFolderService: ExcaliFolderService
  ) {
    super(_repo);
  }

  async findAllForUser(
    query: FilterExcaliCanvasDTO,
    authUser: IActiveUser
  ): Promise<SuccessResponse> {
    const limit = Number(query?.limit || 10);
    const page = Number(query?.page || 1);
    const skip = (page - 1) * limit;

    const qb = this.repo
      .createQueryBuilder("canvas")
      .leftJoinAndSelect("canvas.user", "user")
      .leftJoinAndSelect("canvas.folder", "folder")
      .where("user.id = :userId", { userId: authUser.id })
      .orderBy("canvas.id", "DESC")
      .take(limit)
      .skip(skip);

    if (query?.folderId) {
      qb.andWhere("folder.id = :folderId", { folderId: query.folderId });
    }

    if (query?.searchTerm) {
      qb.andWhere("canvas.name ILIKE :searchTerm", {
        searchTerm: `%${query.searchTerm}%`,
      });
    }

    const [data, total] = await qb.getManyAndCount();

    return new SuccessResponse("Excali canvas fetched successfully", data, {
      total,
      page,
      limit,
      skip,
    });
  }

  async findByIdForUser(id: number, authUser: IActiveUser): Promise<ExcaliCanvas> {
    const canvas = await this.repo.findOne({
      where: {
        id,
        user: {
          id: authUser.id,
        },
      },
      relations: ["user", "folder"],
    });

    if (!canvas) {
      throw new NotFoundException("Excali canvas not found");
    }

    return canvas;
  }

  async createForUser(
    payload: CreateExcaliCanvasDTO,
    authUser: IActiveUser
  ): Promise<ExcaliCanvas> {
    await this.excaliFolderService.findByIdForUser(payload.folderId, authUser);

    return this.createOneBase(
      {
        name: payload.name,
        canvasData: payload.canvasData,
        folder: { id: payload.folderId },
        user: { id: authUser.id },
        createdBy: { id: authUser.id },
      } as ExcaliCanvas,
      { relations: ["user", "folder"] }
    );
  }

  async updateForUser(
    id: number,
    payload: UpdateExcaliCanvasDTO,
    authUser: IActiveUser
  ): Promise<ExcaliCanvas> {
    await this.findByIdForUser(id, authUser);

    if (payload.folderId) {
      await this.excaliFolderService.findByIdForUser(payload.folderId, authUser);
    }

    return this.updateOneBase(
      id,
      {
        name: payload.name,
        canvasData: payload.canvasData,
        folder: payload.folderId ? { id: payload.folderId } : undefined,
        updatedBy: { id: authUser.id },
      },
      { relations: ["user", "folder"] }
    );
  }

  async deleteForUser(id: number, authUser: IActiveUser): Promise<SuccessResponse> {
    await this.findByIdForUser(id, authUser);
    return this.softDeleteOneBase(id);
  }
}
