import { Injectable } from '@nestjs/common';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { UsersRepository } from './users.repository';

@Injectable()
export class AuthService {
  constructor(private users: UsersRepository) { }

  async signUp(authCredentialsDto: AuthCredentialsDto): Promise<{ accessToken: string }> {
    return this.users.createUser(authCredentialsDto);
  }

  async signIn(authCredentialsDto: AuthCredentialsDto): Promise<{ accessToken: string }> {
    return this.users.loginUser(authCredentialsDto);
  }

}
