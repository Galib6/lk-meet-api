import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { BaseService } from "@src/app/base/base.service";
import { IActiveUser } from "@src/app/decorators/active-user.decorator";
import { SuccessResponse } from "@src/app/types";
import { Repository } from "typeorm";
import { CreateExcaliFolderDTO } from "../dtos/excaliFolder/create.dto";
import { FilterExcaliFolderDTO } from "../dtos/excaliFolder/filter.dto";
import { UpdateExcaliFolderDTO } from "../dtos/excaliFolder/update.dto";
import { ExcaliFolder } from "../entities/excaliFolder.entity";

@Injectable()
export class ExcaliFolderService extends BaseService<ExcaliFolder> {
  constructor(
    @InjectRepository(ExcaliFolder)
    public readonly _repo: Repository<ExcaliFolder>
  ) {
    super(_repo);
  }

  async findAllForUser(
    query: FilterExcaliFolderDTO,
    authUser: IActiveUser
  ): Promise<SuccessResponse> {
    const limit = Number(query?.limit || 10);
    const page = Number(query?.page || 1);
    const skip = (page - 1) * limit;

    const qb = this.repo
      .createQueryBuilder("folder")
      .leftJoinAndSelect("folder.user", "user")
      .where("user.id = :userId", { userId: authUser.id })
      .orderBy("folder.id", "DESC")
      .take(limit)
      .skip(skip);

    if (query?.searchTerm) {
      qb.andWhere("folder.name ILIKE :searchTerm", {
        searchTerm: `%${query.searchTerm}%`,
      });
    }

    const [data, total] = await qb.getManyAndCount();

    return new SuccessResponse("Excali folders fetched successfully", data, {
      total,
      page,
      limit,
      skip,
    });
  }

  async findByIdForUser(id: number, authUser: IActiveUser): Promise<ExcaliFolder> {
    const folder = await this.repo.findOne({
      where: {
        id,
        user: {
          id: authUser.id,
        },
      },
      relations: ["user"],
    });

    if (!folder) {
      throw new NotFoundException("Excali folder not found");
    }

    return folder;
  }

  async createForUser(
    payload: CreateExcaliFolderDTO,
    authUser: IActiveUser
  ): Promise<ExcaliFolder> {
    return this.createOneBase(
      {
        name: payload.name,
        user: { id: authUser.id },
        createdBy: { id: authUser.id },
      } as ExcaliFolder,
      { relations: ["user"] }
    );
  }

  async updateForUser(
    id: number,
    payload: UpdateExcaliFolderDTO,
    authUser: IActiveUser
  ): Promise<ExcaliFolder> {
    await this.findByIdForUser(id, authUser);

    return this.updateOneBase(
      id,
      {
        name: payload?.name,
        updatedBy: { id: authUser.id },
      },
      { relations: ["user"] }
    );
  }

  async deleteForUser(id: number, authUser: IActiveUser): Promise<SuccessResponse> {
    await this.findByIdForUser(id, authUser);
    return this.softDeleteOneBase(id);
  }
}
