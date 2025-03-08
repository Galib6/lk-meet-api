import { Injectable } from '@nestjs/common';
import { JWTHelper } from '@src/app/helpers';
import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({
  name: 'AuthTokenValidatorPipe',
  async: true,
})
@Injectable()
export class AuthTokenValidatorPipe implements ValidatorConstraintInterface {
  constructor(private readonly jwtHelper: JWTHelper) {}

  public async validate(value: string) {
    const isValid = await this.jwtHelper.verify(value);
    return isValid ? true : false;
  }

  public defaultMessage(args: ValidationArguments) {
    return `Provided token is invalid`;
  }
}
