import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Request,
  Response,
  UseGuards,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { ActiveUser, Auth } from "@src/app/decorators";
import { IActiveUser } from "@src/app/decorators/active-user.decorator";
import { AuthType } from "@src/app/enums/auth-type.enum";
import { GoogleOAuthGuard } from "@src/app/guards/googleAuth/google.guard";
import { SuccessResponse } from "@src/app/types";
import {
  ChangePasswordDTO,
  GoogleAuthRequestDTO,
  LoginDTO,
  RefreshTokenDTO,
  RegisterDTO,
  ResetPasswordDTO,
  VerifyResetPasswordDTO,
} from "../dtos";
import { ValidateDTO } from "../dtos/validate.dto";
import { AuthService } from "../services/auth.service";

@ApiTags("Auth")
// @ApiBearerAuth()
@Auth(AuthType.None)
@Controller("auth")
export class AuthController {
  constructor(private readonly service: AuthService) {}

  @Get("google")
  async googleAuthRequest(
    @Query() query: GoogleAuthRequestDTO,
    @Response() res
  ) {
    const authorizationUrl = await this.service.googleAuthRequest(query);
    res.redirect(authorizationUrl);
  }

  @Get("google-redirect")
  @UseGuards(GoogleOAuthGuard)
  async googleAuthRedirect(@Request() req, @Response() res) {
    const { user } = req;
    const { state } = req.query;
    const responseData = await this.service.googleLogin(user, state);
    res.redirect(responseData.callBackUrl);
  }

  @Post("validate")
  async validate(@Body() body: ValidateDTO): Promise<SuccessResponse> {
    return this.service.validate(body);
  }

  @Auth(AuthType.None)
  @Post("login")
  async loginUser(@Body() body: LoginDTO) {
    return this.service.loginUser(body);
  }

  @Post("register")
  async registerUser(@Body() body: RegisterDTO) {
    return this.service.registerUser(body);
  }

  @Post("refresh-token")
  async refreshToken(@Body() body: RefreshTokenDTO) {
    return this.service.refreshToken(body);
  }

  @Post("reset-password-request")
  async resetPassword(@Body() body: ResetPasswordDTO) {
    return this.service.resetPassword(body);
  }

  @Post("reset-password-verify")
  async verifyPassword(@Body() body: VerifyResetPasswordDTO) {
    return this.service.verifyResetPassword(body);
  }

  @Post("change-password")
  async changePassword(
    @Body() body: ChangePasswordDTO,
    @ActiveUser() authUser: IActiveUser
  ) {
    return this.service.changePassword(body, authUser);
  }
}
