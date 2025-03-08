import { HttpService } from "@nestjs/axios";
import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { IActiveUser } from "@src/app/decorators/active-user.decorator";
import { ENUM_AUTH_PROVIDERS } from "@src/app/enums/common.enums";
import { BcryptHelper } from "@src/app/helpers";
import { SuccessResponse } from "@src/app/types";
import { ENV, ENV_PRODUCTION } from "@src/env";
import { gen6digitOTP } from "@src/shared";
import * as Crypto from "crypto";
import { firstValueFrom } from "rxjs";
import { DataSource } from "typeorm";
import { User } from "../../user/entities/user.entity";
import { UserRoleService } from "../../user/services/userRole.service";
import {
  GoogleAuthRequestDTO,
  LoginDTO,
  RefreshTokenDTO,
  RegisterDTO,
  ResetPasswordDTO,
  SendOtpDTO,
  VerifyOtpDTO,
  VerifyResetPasswordDTO,
} from "../dtos";
import { ValidateDTO } from "../dtos/validate.dto";
import { JWTHelper } from "./../../../helpers/jwt.helper";
import { UserRole } from "./../../user/entities/userRole.entity";
import { UserService } from "./../../user/services/user.service";
import { ChangePasswordDTO } from "./../dtos/changePassword.dto";
import { AuthStatService } from "./authStat.service";

@Injectable()
export class AuthService {
  constructor(
    private readonly authStatService: AuthStatService,
    private readonly userService: UserService,
    private readonly userRoleService: UserRoleService,
    private readonly jwtHelper: JWTHelper,
    private readonly bcryptHelper: BcryptHelper,
    private readonly dataSource: DataSource,
    private readonly http: HttpService
  ) {}
  async googleAuthRequest(query: GoogleAuthRequestDTO): Promise<string> {
    const { webRedirectUrl } = query;
    const state = JSON.stringify({ webRedirectUrl, provider: "google" });
    const scopes = [
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/userinfo.profile",
    ];
    const authorizationUrl =
      "https://accounts.google.com/o/oauth2/v2/auth" +
      `?client_id=${ENV.google.clientId}` +
      `&redirect_uri=${ENV.google.redirectUrl}` +
      "&response_type=code" +
      "&scope=" +
      scopes.join(" ") +
      "&state=" +
      state;
    return authorizationUrl;
  }

  async validateUserUsingIdentifierAndPassword(
    identifier: string,
    password: string
  ): Promise<User> {
    const user = await this.userService.findOne({
      where: {
        email: identifier,
      },
    });

    if (!user) {
      throw new UnauthorizedException();
    }

    const isPasswordValid = await this.bcryptHelper.compareHash(
      password,
      user.password
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException();
    }

    return user;
  }

  async resetPassword(payload: ResetPasswordDTO): Promise<SuccessResponse> {
    const { email } = payload;
    const user = await this.userService.isExist({ email });

    const otp = gen6digitOTP();
    const hash = this.jwtHelper.generateOtpHash(email, otp);

    return new SuccessResponse(
      `OTP sent to ${email}. Please check your email.`,
      { email, hash, otp: ENV.config.isDevelopment ? otp : null }
    );
  }

  async verifyResetPassword(
    payload: VerifyResetPasswordDTO
  ): Promise<SuccessResponse> {
    const { email, otp, newPassword, hash } = payload;
    const user = await this.userService.isExist({ email });

    const isOtpVerified = this.jwtHelper.verifyOtpHash(email, otp, hash);

    if (!isOtpVerified) {
      throw new BadRequestException("Invalid OTP");
    }

    await this.userService.save([{ id: user.id, password: newPassword }]);

    return new SuccessResponse(`Password reset successfully. Please login`);
  }

  async changePassword(
    payload: ChangePasswordDTO,
    authUser: IActiveUser
  ): Promise<SuccessResponse> {
    const { oldPassword, newPassword } = payload;

    const isExist = await this.userService.findOne({
      where: { id: authUser.id },
      select: [
        "id",
        "firstName",
        "lastName",
        "email",
        "password",
        "phoneNumber",
      ],
    });

    if (!isExist) {
      throw new BadRequestException("User does not exists");
    }

    const isPasswordMatched = await this.bcryptHelper.compareHash(
      oldPassword,
      isExist.password
    );

    if (!isPasswordMatched) {
      throw new BadRequestException("Invalid old password");
    }

    await this.userService.save([{ id: isExist.id, password: newPassword }]);

    return new SuccessResponse(`Password changed successfully. Please login`);
  }

  async registerUser(payload: RegisterDTO): Promise<SuccessResponse> {
    const user = await this.userService.registerUser(payload);
    return new SuccessResponse(
      "User registered successfully. Please login",
      user
    );
  }

  async refreshToken(payload: RefreshTokenDTO): Promise<SuccessResponse> {
    const decoded = await this.jwtHelper.verifyRefreshToken(
      payload.refreshToken
    );
    if (!decoded.user || !decoded.user.id) {
      throw new BadRequestException("Invalid token");
    }
    const user = await this.userService.findOne({
      where: { id: decoded.user.id },
      select: [
        "id",
        "firstName",
        "lastName",
        "email",
        "password",
        "phoneNumber",
      ],
    });

    const userRoles = (await this.userRoleService.findAllBase(
      { user: user.id as any },
      { relations: ["role"], withoutPaginate: true }
    )) as UserRole[];

    const roles = userRoles.map((uR) => uR.role.title);
    const permissions = await this.userRoleService.getUserPermissions(user.id);

    const tokenPayload = {
      user: {
        id: user.id,
        name: user?.firstName + " " + user?.lastName,
        roles,
      },
    };

    const refreshTokenPayload = {
      user: { id: user.id, name: user?.firstName + " " + user?.lastName },
      isRefreshToken: true,
    };

    const permissionTokenPayload = { permissions };

    const token = this.jwtHelper.makeAccessToken(tokenPayload);
    const refreshToken = this.jwtHelper.makeRefreshToken(refreshTokenPayload);
    const permissionToken = this.jwtHelper.makePermissionToken(
      permissionTokenPayload
    );

    return new SuccessResponse("Refresh token success", {
      token,
      refreshToken,
      permissionToken,
      user:
        ENV.config.nodeEnv === "production" ? null : { ...tokenPayload.user },
    });
  }

  async loginUser(payload: LoginDTO): Promise<SuccessResponse> {
    const user = await this.userService.loginUser(payload);
    const userRoles = (await this.userRoleService.findAllBase(
      { user: user.id as any },
      { relations: ["role"], withoutPaginate: true }
    )) as UserRole[];

    const roles = userRoles?.map((uR) => uR.role?.title) || [];
    const permissions = await this.userRoleService.getUserPermissions(user.id);

    const tokenPayload = {
      user: {
        id: user.id,
        name: user?.firstName + " " + user?.lastName,
        roles,
      },
    };

    const refreshTokenPayload = {
      user: { id: user.id, name: user?.firstName + " " + user?.lastName },
      isRefreshToken: true,
    };

    const permissionTokenPayload = { permissions };

    const token = await this.jwtHelper.makeAccessToken(tokenPayload);
    const refreshToken =
      await this.jwtHelper.makeRefreshToken(refreshTokenPayload);
    const permissionToken = await this.jwtHelper.makePermissionToken(
      permissionTokenPayload
    );

    return new SuccessResponse("Login success", {
      token,
      refreshToken,
      permissionToken,
      user:
        ENV.config.nodeEnv === "production" ? null : { ...tokenPayload.user },
    });
  }

  async sendOtp(payload: SendOtpDTO) {
    const user = await this.userService.findOrCreateByPhoneNumber(
      payload.phoneNumber
    );

    const otp = gen6digitOTP();
    const authStat = await this.authStatService.createOrUpdateOtpByPhoneNumber(
      payload.phoneNumber,
      otp
    );

    return new SuccessResponse(
      "OTP sent successfully",
      ENV.config.nodeEnv === "production" ? null : { otp: authStat.otp }
    );
  }

  async verifyOtp(payload: VerifyOtpDTO) {
    await this.authStatService.verifyOtp(payload.phoneNumber, payload.otp);

    const user = await this.userService.findOneBase({
      phoneNumber: payload.phoneNumber,
    });

    const userRoles = (await this.userRoleService.findAllBase(
      { user: user.id as any },
      { relations: ["role"], withoutPaginate: true }
    )) as UserRole[];

    const roles = userRoles.map((uR) => uR.role.title);

    const tokenPayload = { user: { id: user.id, roles } };

    const refreshTokenPayload = { user: { id: user.id }, isRefreshToken: true };

    const token = this.jwtHelper.makeAccessToken(tokenPayload);
    const refreshToken = this.jwtHelper.makeRefreshToken(refreshTokenPayload);

    return new SuccessResponse("OTP verified successfully", {
      token,
      refreshToken,
      user:
        ENV.config.nodeEnv === "production" ? null : { ...tokenPayload.user },
    });
  }

  async googleLogin(
    userData: Record<string, any>,
    state: string
  ): Promise<{
    callBackUrl: string;
  }> {
    if (!userData) {
      throw new BadRequestException("No user from google");
    }
    const additionalData = JSON.parse(state) as {
      webRedirectUrl: string;
      provider: string;
    };
    let isExist: User = null;

    isExist = await this.userService.findOne({
      where: { email: userData.email },
    });

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    queryRunner.startTransaction();

    if (!isExist) {
      try {
        const newUserData: User = {
          firstName: userData.firstName,
          lastName: userData.lastName,
          avatar: userData?.picture,
          email: userData?.email,
          authProvider: ENUM_AUTH_PROVIDERS.GOOGLE,
          phoneNumber: userData?.phoneNumber,
          password: Crypto.randomBytes(20).toString("hex"),
          isVerified: true,
        };

        await queryRunner.manager.save(Object.assign(new User(), newUserData));
        await queryRunner.commitTransaction();
      } catch (error) {
        await queryRunner.rollbackTransaction();
      }
    }

    // const newCreatedUser = await this.userService.findOne({
    //   where: { identifier: userData.email },
    // });

    // if (!newCreatedUser) {
    //   throw new BadRequestException('User not created');
    // }

    // const tokenData = {
    //   userId: newCreatedUser.id,
    // };

    // const token = await this.jwtHelper.makeAccessToken(tokenData);
    // console.log('🚀 ~ AuthService ~ token:', token);

    const callBackUrl = `${additionalData.webRedirectUrl}?token=${userData?.accessToken}&provider=${additionalData.provider}`;

    return {
      callBackUrl,
    };
  }

  async validate(payload: ValidateDTO): Promise<SuccessResponse> {
    if (payload.provider === ENUM_AUTH_PROVIDERS.GOOGLE)
      return this.validateUsingGoogleAuth(payload);
    // return this.validateUsingSystemAuth(payload);
  }

  async validateUsingGoogleAuth(
    payload: ValidateDTO
  ): Promise<SuccessResponse> {
    const googleUrl = `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${payload.token}`;

    const googleResponse = await this.http.get(googleUrl);
    const responseData = ((await firstValueFrom(googleResponse)) as any).data;

    let user: User = null;
    let isEmailRequired = false;

    user = await this.userService.findOne({
      where: { email: responseData.email },
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    if (isEmailRequired) {
      const tokenPayload = {
        user: {
          id: user.id,
        },
      };

      const token = this.jwtHelper.signToken(
        ENV.jwt.jwtExpiresIn,
        tokenPayload
      );

      return new SuccessResponse("Validated successfully", {
        token,
        isEmailRequired: true,
        user: ENV_PRODUCTION ? null : { ...tokenPayload.user },
      });
    }

    const tokenPayload = {
      user: {
        id: user.id,
        email: user.email,
      },
    };

    const refreshTokenPayload = {
      user: {
        id: user.id,
      },
      isRefreshToken: true,
    };
    const token = this.jwtHelper.makeAccessToken(tokenPayload);
    const refreshToken = this.jwtHelper.makeRefreshToken(refreshTokenPayload);

    return new SuccessResponse("Validated successfully", {
      token,
      refreshToken,
      user: ENV_PRODUCTION ? null : { ...tokenPayload.user },
    });
  }
}
