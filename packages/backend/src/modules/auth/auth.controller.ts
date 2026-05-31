import { Controller, Post, Body, Get, UseGuards, Req, Query, Res, BadRequestException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { AuthService } from './auth.service'
import { CaptchaService } from './captcha.service'
import { CryptoService } from './crypto.service'
import { OAuthService } from './oauth.service'
import { JwtService } from '@nestjs/jwt'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { CurrentUser } from '../../common/decorators/current-user.decorator'
import type { Response } from 'express'

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private captchaService: CaptchaService,
    private cryptoService: CryptoService,
    private oauthService: OAuthService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  @Get('captcha')
  getCaptcha() {
    return this.captchaService.generateCaptcha()
  }

  @Get('public-key')
  getPublicKey() {
    return { publicKey: this.cryptoService.getPublicKey() }
  }

  @Post('login')
  login(@Body() body: { username: string; password: string; captchaId: string; captchaCode: string }) {
    // 验证验证码
    if (!this.captchaService.verifyCaptcha(body.captchaId, body.captchaCode)) {
      throw new BadRequestException('验证码错误或已过期')
    }
    // RSA 解密密码
    const rawPassword = this.cryptoService.decryptPassword(body.password)
    return this.authService.login(body.username, rawPassword)
  }

  @Post('register')
  register(@Body() body: { username: string; password: string; email: string }) {
    // RSA 解密密码
    const rawPassword = this.cryptoService.decryptPassword(body.password)
    return this.authService.register(body.username, rawPassword, body.email)
  }

  @UseGuards(JwtAuthGuard)
  @Post('refresh')
  refresh(@Req() req: any) {
    return this.authService.refreshToken(req.user)
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  profile(@CurrentUser() user: any) {
    return user
  }

  // ========== OAuth 登录接口 ==========

  @Get('github')
  githubLogin(@Res() res: Response) {
    const clientId = this.configService.get('GITHUB_CLIENT_ID')
    const callbackUrl = this.configService.get('GITHUB_CALLBACK_URL')
    const url = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(callbackUrl)}&scope=user:email`
    res.redirect(url)
  }

  @Get('github/callback')
  async githubCallback(@Query('code') code: string, @Res() res: Response) {
    try {
      const user = await this.oauthService.handleGithubCallback(code)
      const payload = {
        sub: user.id,
        username: user.username,
        roles: user.roles?.map((r) => r.name) ?? [],
      }
      const accessToken = this.jwtService.sign(payload)
      const refreshToken = this.jwtService.sign(payload, { expiresIn: '30d' })
      const frontendUrl = this.configService.get('FRONTEND_URL', 'http://localhost:5173')
      const userData = encodeURIComponent(JSON.stringify({
        id: user.id,
        username: user.username,
        email: user.email,
        avatarUrl: user.avatarUrl,
        roles: user.roles,
      }))
      res.redirect(`${frontendUrl}/#/oauth-callback?accessToken=${accessToken}&refreshToken=${refreshToken}&user=${userData}`)
    } catch {
      const frontendUrl = this.configService.get('FRONTEND_URL', 'http://localhost:5173')
      res.redirect(`${frontendUrl}/#/oauth-callback?error=oauth_failed`)
    }
  }

  @Get('wechat')
  wechatLogin(@Res() res: Response) {
    const appId = this.configService.get('WECHAT_APP_ID')
    const callbackUrl = this.configService.get('WECHAT_CALLBACK_URL')
    const url = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${appId}&redirect_uri=${encodeURIComponent(callbackUrl)}&response_type=code&scope=snsapi_userinfo&state=wechat#wechat_redirect`
    res.redirect(url)
  }

  @Get('wechat/callback')
  async wechatCallback(@Query('code') code: string, @Res() res: Response) {
    try {
      const user = await this.oauthService.handleWechatCallback(code)
      const payload = {
        sub: user.id,
        username: user.username,
        roles: user.roles?.map((r) => r.name) ?? [],
      }
      const accessToken = this.jwtService.sign(payload)
      const refreshToken = this.jwtService.sign(payload, { expiresIn: '30d' })
      const frontendUrl = this.configService.get('FRONTEND_URL', 'http://localhost:5173')
      const userData = encodeURIComponent(JSON.stringify({
        id: user.id,
        username: user.username,
        email: user.email,
        avatarUrl: user.avatarUrl,
        roles: user.roles,
      }))
      res.redirect(`${frontendUrl}/#/oauth-callback?accessToken=${accessToken}&refreshToken=${refreshToken}&user=${userData}`)
    } catch {
      const frontendUrl = this.configService.get('FRONTEND_URL', 'http://localhost:5173')
      res.redirect(`${frontendUrl}/#/oauth-callback?error=oauth_failed`)
    }
  }
}
