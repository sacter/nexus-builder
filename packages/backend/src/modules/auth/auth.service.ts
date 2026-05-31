import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcryptjs'
import { UserService } from '../user/user.service'

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async login(username: string, password: string) {
    const user = await this.userService.findByUsername(username)
    if (!user) throw new UnauthorizedException('用户名或密码错误')

    const valid = await bcrypt.compare(password, user.passwordHash)
    if (!valid) throw new UnauthorizedException('用户名或密码错误')

    const payload = {
      sub: user.id,
      username: user.username,
      roles: user.roles?.map((r) => r.name) ?? [],
    }
    return {
      accessToken: this.jwtService.sign(payload),
      refreshToken: this.jwtService.sign(payload, { expiresIn: '30d' }),
      user: { id: user.id, username: user.username, email: user.email, avatarUrl: user.avatarUrl, roles: user.roles },
    }
  }

  async register(username: string, password: string, email: string) {
    const existing = await this.userService.findByUsername(username)
    if (existing) throw new ConflictException('用户名已存在')

    const user = await this.userService.create({ username, password, email })
    const payload = {
      sub: user.id,
      username: user.username,
      roles: user.roles?.map((r) => r.name) ?? [],
    }
    return {
      accessToken: this.jwtService.sign(payload),
      refreshToken: this.jwtService.sign(payload, { expiresIn: '30d' }),
      user: { id: user.id, username: user.username, email: user.email, avatarUrl: user.avatarUrl, roles: user.roles },
    }
  }

  async refreshToken(user: { sub: string; username: string; roles: string[] }) {
    const payload = { sub: user.sub, username: user.username, roles: user.roles }
    return { accessToken: this.jwtService.sign(payload) }
  }
}
