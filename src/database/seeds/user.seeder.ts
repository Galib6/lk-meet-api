import { BcryptHelper } from "@src/app/helpers";
import { Role } from "@src/app/modules/acl/entities/role.entity";
import { User } from "@src/app/modules/user/entities/user.entity";
import { UserRole } from "@src/app/modules/user/entities/userRole.entity";
import { ENV } from "@src/env";
import { ENUM_ACL_DEFAULT_ROLES } from "@src/shared";
import { DataSource } from "typeorm";

export default class UserSeeder {
  constructor(private readonly dataSource: DataSource) {}

  public async run(): Promise<void> {
    const isSuperAdminExist = await this.dataSource.manager.findOne(User, {
      where: { email: ENV.seedData.email },
    });

    if (!isSuperAdminExist) {
      const bcryptHelper = new BcryptHelper();

      const password = await bcryptHelper.hash(ENV.seedData.password);

      const createdSuperAdmin = await this.dataSource.manager.save(
        Object.assign(new User(), {
          email: ENV.seedData.email,
          identifier: ENV.seedData.email,
          isVerified: true,
          password,
        })
      );

      const superAdminRole = await this.dataSource.manager.findOne(Role, {
        where: {
          title: ENUM_ACL_DEFAULT_ROLES.SUPER_ADMIN,
        },
      });
      await this.dataSource.manager.save(
        Object.assign(new UserRole(), {
          role: superAdminRole.id,
          user: createdSuperAdmin?.id,
        })
      );
    }
  }
}
