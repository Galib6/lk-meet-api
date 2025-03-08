import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ENV } from "@src/env";

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: "postgres",
        autoLoadEntities: true,
        synchronize: ENV.defaultDatabase.synchronization,
        port: ENV.defaultDatabase.port,
        username: ENV.defaultDatabase.user,
        password: ENV.defaultDatabase.password,
        host: ENV.defaultDatabase.host,
        database: ENV.defaultDatabase.databaseName,
        logging: ENV.defaultDatabase.logging,
      }),
    }),
  ],
})
export class DatabaseModule {}
