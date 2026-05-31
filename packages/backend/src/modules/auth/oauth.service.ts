import { Injectable, InternalServerErrorException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import * as bcrypt from 'bcryptjs'
import { OAuthAccount } from './entities/oauth-account.entity'
import { User } from '../user/entities/user.entity'
import { UserService } from '../user/user.service'

interface OAuthProfile {
  providerId: string
  username: string
  avatarUrl?: string
  email?: string
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type JsonData = Record<string, any>

@Injectable()
export class OAuthService {
  constructor(
    @InjectRepository(OAuthAccount)
    private oauthRepo: Repository<OAuthAccount>,
    private userService: UserService,
    private configService: ConfigService,
  ) {}

  async findOAuthAccount(provider: string, providerId: string): Promise<OAuthAccount | null> {
    return this.oauthRepo.findOne({
      where: { provider, providerId },
      relations: ['user'],
    })
  }

  async createOAuthAccount(dto: {
    provider: string
    providerId: string
    providerUsername: string
    accessToken: string
    avatarUrl?: string
    userId: string
  }): Promise<OAuthAccount> {
    const account = this.oauthRepo.create(dto)
    return this.oauthRepo.save(account)
  }

  async findOrCreateUser(provider: string, profile: OAuthProfile, accessToken: string): Promise<User> {
    // 查找已关联的 OAuth 账号
    const existing = await this.findOAuthAccount(provider, profile.providerId)
    if (existing) {
      // 更新 access_token
      await this.oauthRepo.update({ id: existing.id }, { accessToken })
      return existing.user
    }

    // 未关联 -> 自动创建新用户
    const username = `${provider}_${profile.providerId}`
    const randomPassword = bcrypt.genSaltSync(12) // 随机密码，OAuth 用户不需要密码登录
    const user = await this.userService.create({
      username,
      password: randomPassword,
      email: profile.email,
    })

    // 更新头像
    if (profile.avatarUrl) {
      await this.userService.update(user.id, { avatarUrl: profile.avatarUrl })
    }

    // 创建 OAuth 关联
    await this.createOAuthAccount({
      provider,
      providerId: profile.providerId,
      providerUsername: profile.username,
      accessToken,
      avatarUrl: profile.avatarUrl,
      userId: user.id,
    })

    // 返回完整的用户信息
    const fullUser = await this.userService.findById(user.id)
    if (!fullUser) throw new InternalServerErrorException('Failed to find created user')
    return fullUser
  }

  /**
   * GitHub OAuth2 回调处理
   * 1. 用 code 换取 access_token
   * 2. 用 access_token 获取用户信息
   */
  async handleGithubCallback(code: string): Promise<User> {
    const clientId = this.configService.get('GITHUB_CLIENT_ID')
    const clientSecret = this.configService.get('GITHUB_CLIENT_SECRET')

    // Step 1: 用 code 换取 access_token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
      }),
    })

    if (!tokenResponse.ok) {
      throw new InternalServerErrorException('GitHub token exchange failed')
    }

    const tokenData = (await tokenResponse.json()) as JsonData
    const accessToken = tokenData.access_token as string

    if (!accessToken) {
      throw new InternalServerErrorException('GitHub access token not received')
    }

    // Step 2: 用 access_token 获取用户信息
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
      },
    })

    if (!userResponse.ok) {
      throw new InternalServerErrorException('Failed to fetch GitHub user info')
    }

    const githubUser = (await userResponse.json()) as JsonData

    const profile: OAuthProfile = {
      providerId: String(githubUser.id),
      username: githubUser.login as string,
      avatarUrl: githubUser.avatar_url as string,
      email: githubUser.email as string | undefined,
    }

    return this.findOrCreateUser('github', profile, accessToken)
  }

  /**
   * 微信 OAuth2 回调处理
   * 1. 用 code 换取 access_token + openid
   * 2. 用 access_token + openid 获取用户信息
   */
  async handleWechatCallback(code: string): Promise<User> {
    const appId = this.configService.get('WECHAT_APP_ID')
    const appSecret = this.configService.get('WECHAT_APP_SECRET')

    // Step 1: 用 code 换取 access_token + openid
    const tokenUrl = `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${appId}&secret=${appSecret}&code=${code}&grant_type=authorization_code`
    const tokenResponse = await fetch(tokenUrl)

    if (!tokenResponse.ok) {
      throw new InternalServerErrorException('WeChat token exchange failed')
    }

    const tokenData = (await tokenResponse.json()) as JsonData

    if (tokenData.errcode) {
      throw new InternalServerErrorException(`WeChat error: ${tokenData.errmsg}`)
    }

    const accessToken = tokenData.access_token as string
    const openid = tokenData.openid as string

    // Step 2: 用 access_token + openid 获取用户信息
    const userUrl = `https://api.weixin.qq.com/sns/userinfo?access_token=${accessToken}&openid=${openid}&lang=zh_CN`
    const userResponse = await fetch(userUrl)

    if (!userResponse.ok) {
      throw new InternalServerErrorException('Failed to fetch WeChat user info')
    }

    const wechatUser = (await userResponse.json()) as JsonData

    if (wechatUser.errcode) {
      throw new InternalServerErrorException(`WeChat error: ${wechatUser.errmsg}`)
    }

    const profile: OAuthProfile = {
      providerId: (wechatUser.unionid || wechatUser.openid) as string,
      username: wechatUser.nickname as string,
      avatarUrl: wechatUser.headimgurl as string,
    }

    return this.findOrCreateUser('wechat', profile, accessToken)
  }
}
