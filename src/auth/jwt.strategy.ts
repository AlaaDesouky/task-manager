import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from './jwt-payload.interface';
import { User } from './user.entity';
import { UsersRepository } from './users.repository';
import * as config from 'config'

const jwtConfig = config.get('jwt')

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private user: UsersRepository) {
    super({
      secretOrKey: process.env.JWT_SECRET || jwtConfig.secret,
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
    })
  }

  async validate(payload: JwtPayload): Promise<User> {
    const user: User = await this.user.getUser(payload.username)
    if (!user) {
      throw new UnauthorizedException();
    }

    return user
  }
}