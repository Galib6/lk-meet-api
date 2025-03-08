import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { BaseService } from "@src/app/base";
import { In, Repository } from "typeorm";
import { RolePermission } from "../entities/rolePermission.entity";

@Injectable()
export class RolePermissionService extends BaseService<RolePermission> {
  constructor(
    @InjectRepository(RolePermission)
    private readonly _repo: Repository<RolePermission>
  ) {
    super(_repo);
  }

  public async findRolePermissionByRoles(roles: string[]) {
    return this.repo.find({
      where: {
        role: In(roles),
      },
    });
  }
}
