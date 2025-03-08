import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { BaseService } from "@src/app/base";
import { asyncForEach } from "@src/shared";
import { DataSource, In, Repository } from "typeorm";
import { FilterPermissionDTO, RemovePermissionsDTO } from "../dtos";
import { Permission } from "../entities/permission.entity";
import { Role } from "../entities/role.entity";
import { AddPermissionsDTO } from "./../dtos/role/addPermissions.dto";
import { RolePermission } from "./../entities/rolePermission.entity";
import { PermissionService } from "./permission.service";
import { RolePermissionService } from "./rolePermission.service";

@Injectable()
export class RoleService extends BaseService<Role> {
  constructor(
    @InjectRepository(Role)
    private readonly _repo: Repository<Role>,
    private readonly dataSource: DataSource,
    private readonly rolePermissionService: RolePermissionService,
    private readonly permissionService: PermissionService
  ) {
    super(_repo);
  }

  async availablePermissions(
    id: number,
    payload: FilterPermissionDTO
  ): Promise<Permission[]> {
    const isExist = await this.isExist({ id });

    const permissions = (await this.permissionService.findAllBase(payload, {
      withoutPaginate: true,
    })) as Permission[];

    const rolePermissions = await this.rolePermissionService.find({
      where: {
        role: { id: isExist.id as any },
      },
    });

    if (permissions && permissions.length > 0) {
      permissions.forEach((permission) => {
        const isAlreadyAdded = rolePermissions.find(
          (rolePermission) => rolePermission.permissionId === permission.id
        );
        permission.isAlreadyAdded = !!isAlreadyAdded;
      });
    }

    return permissions;
  }

  async addPermissions(
    id: number,
    payload: AddPermissionsDTO
  ): Promise<Permission[]> {
    const isRoleExist = await this.isExist({ id });

    const addedPermissions: string[] = [];

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      payload.permissions = [...new Set(payload.permissions)];

      await asyncForEach(payload.permissions, async (permissionId) => {
        const isRolePermissionExist = await this.rolePermissionService.findOne({
          where: {
            role: { id: isRoleExist.id as any },
            permission: { id: permissionId },
          },
        });

        if (isRolePermissionExist) {
          throw new BadRequestException("Permission already exist");
        }
        await queryRunner.manager.save(
          Object.assign(new RolePermission(), {
            role: isRoleExist.id,
            permission: permissionId,
          })
        );

        addedPermissions.push(permissionId);
      });

      await queryRunner.commitTransaction();
      await queryRunner.release();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();

      throw new BadRequestException(error?.message || "Something went wrong");
    }

    const permissions = await this.permissionService.find({
      where: {
        id: In(addedPermissions),
      },
    });

    permissions.forEach((permission) => {
      permission.isAlreadyAdded = true;
    });

    return permissions;
  }

  async removePermissions(
    id: number,
    payload: RemovePermissionsDTO
  ): Promise<Permission[]> {
    const isRoleExist = await this.isExist({ id });

    const removedPermissions: string[] = [];

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      payload.permissions = [...new Set(payload.permissions)];

      await asyncForEach(payload.permissions, async (permissionId) => {
        const isRolePermissionExist = await this.rolePermissionService.findOne({
          where: {
            role: { id: isRoleExist.id as any },
            permission: { id: permissionId },
          },
        });

        if (!isRolePermissionExist) {
          throw new BadRequestException("Permission does not exist");
        }
        await queryRunner.manager.delete(RolePermission, {
          role: isRoleExist.id,
          permission: permissionId,
        });

        removedPermissions.push(permissionId);
      });

      await queryRunner.commitTransaction();
      await queryRunner.release();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();

      throw new BadRequestException(error?.message || "Something went wrong");
    }

    const permissions = await this.permissionService.find({
      where: {
        id: In(removedPermissions),
      },
    });

    permissions.forEach((permission) => {
      permission.isAlreadyAdded = false;
    });

    return permissions;
  }
}
