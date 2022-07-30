import { ConflictException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { User } from './user.entity';
import * as bcrypt from 'bcrypt'
import { JwtPayload } from './jwt-payload.interface';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
    private jwtService: JwtService
  ) { }

  async createUser(authCredentialsDto: AuthCredentialsDto): Promise<{ accessToken: string }> {
    const { password, username } = authCredentialsDto;

    const hashedPassword = await this.hashPassword(password)

    const user = this.usersRepository.create({ username, password: hashedPassword })

    try {
      await this.usersRepository.save(user)
      const accessToken: string = this.generateJwtAccessToken({ username })
      return { accessToken }
    } catch (error) {
      if (error.code === '23505') {
        // duplicate username
        throw new ConflictException('Username already exists')
      } else {
        throw new InternalServerErrorException()
      }
    }
  }

  async loginUser(authCredentialsDto: AuthCredentialsDto): Promise<{ accessToken: string }> {
    const { username, password } = authCredentialsDto
    try {
      const user: User = await this.usersRepository.findOne({ where: { username }, select: ['id', 'password'] })
      const isValidPassword: boolean = await this.comparePassword(password, user.password)

      if (user && isValidPassword) {
        const accessToken: string = this.generateJwtAccessToken({ username })
        return { accessToken }
      }

    } catch (error) {
      throw new UnauthorizedException('Please check your login credentials')
    }
  }

  async getUser(username: string): Promise<User> {
    return this.usersRepository.findOne({ where: { username } })
  }

  private async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt)

    return hashedPassword;
  }

  private async comparePassword(password: string, storedPassword: string): Promise<boolean> {
    return await bcrypt.compare(password, storedPassword)
  }

  private generateJwtAccessToken(payload: JwtPayload): string {
    return this.jwtService.sign(payload)
  }
}