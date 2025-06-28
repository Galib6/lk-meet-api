import { Logger, ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import { json, urlencoded } from "body-parser";
import { join } from "path";
import { AppModule } from "./app/app.module";
import { KafkaFactory } from "./app/modules/kafka/config/kafka.factory";
import { ENV } from "./env";
import { createLogger } from "./logger";
import { setupSecurity } from "./security";
import { setupSwagger } from "./swagger";

const logger = new Logger();
//test

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: ENV.config.isDevelopment
      ? createLogger()
      : ["error", "warn", "debug", "log", "verbose"],
  });

  const kafkaOptions = KafkaFactory.createMicroserviceOptions();
  if (kafkaOptions) {
    try {
      app.connectMicroservice(kafkaOptions);
      await app.startAllMicroservices();
    } catch (error) {
      console.error("❌ Failed to start Kafka microservice:", error);
    }
  } else {
    console.log("⚠️ Kafka is disabled or configuration is missing");
  }

  app.setBaseViewsDir(join(process.cwd(), "views"));
  app.setViewEngine("hbs");

  app.use(urlencoded({ extended: true }));
  app.use(json({ limit: "10mb" }));
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    })
  );

  app.setGlobalPrefix(ENV.swagger.apiPrefix);

  setupSecurity(app);
  setupSwagger(app);

  await app.listen(ENV.config.port);
  logger.log(
    `🚀🚀🚀🚀 Application is running on: ${await app.getUrl()} 🚀🚀🚀🚀`
  );

  logger.log(
    `📖📖📖 Documentation is available on: ${await app.getUrl()}/docs 📖📖📖`
  );
}
bootstrap();
