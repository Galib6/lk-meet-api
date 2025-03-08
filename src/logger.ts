import { LoggerService } from "@nestjs/common";
import { utilities, WinstonModule, WinstonModuleOptions } from "nest-winston";
import { format, transports } from "winston";
import { ENV } from "./env";

export function createLogger(): LoggerService {
  const logFolder = ENV.logFolder;
  const winstonOptions: WinstonModuleOptions = {
    transports: [
      new transports.Console({
        format: format.combine(format.timestamp(), utilities.format.nestLike()),
        level: "debug",
      }),
      new transports.File({
        format: format.combine(format.timestamp(), utilities.format.nestLike()),
        filename: `${logFolder}/errors.log`,
        level: "error",
      }),
      new transports.File({
        format: format.combine(format.timestamp(), utilities.format.nestLike()),
        filename: `${logFolder}/warnings.log`,
        level: "warning",
      }),
      new transports.File({
        format: format.combine(format.timestamp(), utilities.format.nestLike()),
        filename: `${logFolder}/critical.log`,
        level: "crit",
      }),
      new transports.File({
        format: format.combine(format.timestamp(), utilities.format.nestLike()),
        filename: `${logFolder}/log.log`,
        level: "log",
      }),
    ],
  };

  return WinstonModule.createLogger(winstonOptions);
}
