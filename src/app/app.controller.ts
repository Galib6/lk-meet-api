import { Controller, Get, HttpCode, HttpStatus } from "@nestjs/common";
import {
  ApiBadRequestResponse,
  ApiExcludeEndpoint,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiServiceUnavailableResponse,
} from "@nestjs/swagger";
import { AppService } from "./app.service";
import { Auth } from "./decorators";
import { AuthType } from "./enums/auth-type.enum";

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @ApiOperation({ summary: "Check API status" })
  @ApiOkResponse({ description: "The service is operating correctly" })
  @ApiInternalServerErrorResponse({ description: "Internal Server Error" })
  @ApiBadRequestResponse({ description: "Communication error with the server" })
  @ApiServiceUnavailableResponse({
    description: "The service is not available",
  })
  @HttpCode(HttpStatus.OK)
  @ApiExcludeEndpoint()
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  // in app.controller.ts
  @Get("/health")
  @Auth(AuthType.None)
  health() {
    return { status: "ok" };
  }
}
