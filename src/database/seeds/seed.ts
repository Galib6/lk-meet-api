import { Role } from "@src/app/modules/acl/entities/role.entity";
import { User } from "@src/app/modules/user/entities/user.entity";
import { UserRole } from "@src/app/modules/user/entities/userRole.entity";
import { ENV } from "@src/env";
import { DataSource } from "typeorm";
import RoleSeeder from "./role.seeder";
import UserSeeder from "./user.seeder";

const dataSource = new DataSource({
  type: ENV.defaultDatabase.type,
  host: ENV.defaultDatabase.host,
  port: ENV.defaultDatabase.port,
  username: ENV.defaultDatabase.user,
  password: ENV.defaultDatabase.password,
  database: ENV.defaultDatabase.databaseName,
  ssl: ENV.config.isDevelopment ? false : { rejectUnauthorized: false },
  synchronize: ENV.defaultDatabase.synchronization,
  entities: [Role, User, UserRole],
});

(async () => {
  const roleSeeder = new RoleSeeder(dataSource);
  const userSeeder = new UserSeeder(dataSource);

  await dataSource.initialize();

  await roleSeeder.run();
  await userSeeder.run();

  await dataSource.destroy();
})();
