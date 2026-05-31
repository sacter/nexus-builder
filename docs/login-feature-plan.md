# 登录页用户名+密码+验证码登录 & 注册 & 密码加密 & OAuth登录

## 需求汇总
1. 登录：用户名 + 密码 + 验证码
2. 登录调用 `POST /auth/login`，注册调用 `POST /auth/register`
3. 新增验证码接口 `GET /auth/captcha`
4. 注册使用用户名 + 密码 + 邮箱
5. 登录时密码前后端加密（前端 RSA 加密，后端解密后再做 bcrypt 比对）
6. 其他登录方式改为微信、GitHub 登录，实现完整 OAuth2 登录流程

## 现状分析
- 前端 LoginView.vue 当前使用 **邮箱** 登录，需改为 **用户名** 登录
- 后端 `auth.controller.ts` 已有 `login` / `register` 接口
  - `login` 接收 `username` + `password`
  - `register` 接收 `username` + `password` + `email(可选)`，需改为邮箱必填
- 后端尚未集成 Redis，验证码存储采用 **内存 Map + TTL** 方案
- 后端无验证码相关功能，无密码加密功能，无 OAuth 功能
- 密码加密方案：前端 RSA 公钥加密 -> 后端 RSA 私钥解密得到明文 -> 再做 bcrypt 比对
  - 新增 `GET /auth/public-key` 接口返回 RSA 公钥
  - 后端启动时生成 RSA 密钥对，或从配置读取
- OAuth 登录方案：
  - 新建 `oauth_accounts` 表存储第三方账号关联（provider + providerId -> userId）
  - 使用 passport + passport-github2 + 自定义微信策略
  - 微信 OAuth2：需要 AppID + AppSecret，走微信开放平台授权流程
  - GitHub OAuth2：需要 Client ID + Client Secret，走 GitHub OAuth 授权流程
  - 流程：前端点击跳转 -> 第三方授权 -> 回调接口 -> 查找/创建用户 -> 签发 JWT -> 重定向前端

---

## Task 1: 后端 - 安装依赖

```bash
cd packages/backend && pnpm add svg-captcha passport-github2 && pnpm add -D @types/svg-captcha @types/passport-github2
```
- `svg-captcha`: 验证码生成
- `passport-github2`: GitHub OAuth2 Passport 策略
- Node.js 内置 `crypto` 模块提供 RSA 支持，无需额外安装
- 微信 OAuth2 使用自定义策略，直接调用微信 API，无需额外包

---

## Task 2: 后端 - 创建 CaptchaService

新建 `packages/backend/src/modules/auth/captcha.service.ts`：
- `generateCaptcha()`: 使用 svg-captcha 生成验证码，返回 `{ captchaId, svg }`
  - captchaId 为 uuid
  - 验证码文本存入内存 Map，设置 5 分钟过期
- `verifyCaptcha(captchaId, code)`: 校验验证码，校验后立即删除（一次性使用）
  - 不区分大小写
  - 返回 boolean

---

## Task 3: 后端 - 创建 CryptoService（RSA 密码加解密）

新建 `packages/backend/src/modules/auth/crypto.service.ts`：
- 使用 Node.js `crypto` 模块生成 2048 位 RSA 密钥对
- 在 `onModuleInit()` 中生成密钥对（或从环境变量读取 PEM 格式密钥）
- `getPublicKey()`: 返回 PEM 格式公钥字符串
- `decryptPassword(encrypted: string)`: 用私钥解密前端传来的 RSA 加密密码
  - 使用 `crypto.privateDecrypt` + `RSA_PKCS1_OAEP_PADDING`
  - 返回明文密码字符串

---

## Task 4: 后端 - 修改 AuthController

修改 `packages/backend/src/modules/auth/auth.controller.ts`：
- 注入 `CaptchaService` 和 `CryptoService`
- 新增 `GET /auth/captcha` 接口，返回 `{ captchaId, svg }`
- 新增 `GET /auth/public-key` 接口，返回 `{ publicKey }` 供前端 RSA 加密
- 修改 `POST /auth/login`，body 增加 `captchaId` + `captchaCode` 字段
  - 先验证验证码，验证码错误抛出 `BadRequestException('验证码错误或已过期')`
  - 用 `CryptoService.decryptPassword()` 解密密码后再传给 `authService.login()`
- 修改 `POST /auth/register`，body 中 `email` 改为必填
  - 用 `CryptoService.decryptPassword()` 解密密码后再传给 `authService.register()`

---

## Task 5: 后端 - 修改 AuthService

修改 `packages/backend/src/modules/auth/auth.service.ts`：
- `register()` 方法中 `email` 参数改为必填（非可选）

---

## Task 6: 后端 - 新建 OAuth 关联实体

新建 `packages/backend/src/modules/auth/entities/oauth-account.entity.ts`：
```typescript
@Entity('oauth_accounts')
export class OAuthAccount {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ length: 20 })
  provider: string  // 'github' | 'wechat'

  @Column({ name: 'provider_id', length: 100 })
  providerId: string  // 第三方用户 ID

  @Column({ name: 'provider_username', length: 100, nullable: true })
  providerUsername: string  // 第三方用户名

  @Column({ name: 'access_token', length: 500, nullable: true })
  accessToken: string

  @Column({ name: 'avatar_url', length: 500, nullable: true })
  avatarUrl: string  // 第三方头像

  @ManyToOne(() => User)
  user: User  // 关联本地用户

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date
}
```
- `provider` + `providerId` 唯一索引

---

## Task 7: 后端 - 新建 OAuthService

新建 `packages/backend/src/modules/auth/oauth.service.ts`：
- `findOAuthAccount(provider, providerId)`: 查找已关联的 OAuth 账号
- `createOAuthAccount(dto)`: 创建 OAuth 关联记录
- `findOrCreateUser(provider, profile)`: 核心方法
  - 先通过 provider + providerId 查找 OAuthAccount
  - 已关联 -> 返回关联的 User
  - 未关联 -> 自动创建新用户（用户名自动生成，如 `github_xxx` / `wechat_xxx`），创建 OAuthAccount 关联
- `handleGithubCallback(code)`: 用 code 换取 access_token，再获取 GitHub 用户信息
  - 调用 `https://github.com/login/oauth/access_token`
  - 调用 `https://api.github.com/user` 获取用户资料
  - 调用 `findOrCreateUser('github', profile)` 返回用户
- `handleWechatCallback(code)`: 用 code 换取 access_token + openid，再获取微信用户信息
  - 调用 `https://api.weixin.qq.com/sns/oauth2/access_token`
  - 调用 `https://api.weixin.qq.com/sns/userinfo` 获取用户资料
  - 调用 `findOrCreateUser('wechat', profile)` 返回用户

---

## Task 8: 后端 - 修改 AuthController 添加 OAuth 接口

修改 `packages/backend/src/modules/auth/auth.controller.ts`（在 Task 4 基础上追加）：
- 注入 `OAuthService`
- 新增 `GET /auth/github`：重定向到 GitHub 授权页
  - 拼接 GitHub authorize URL + client_id + redirect_uri + scope
- 新增 `GET /auth/github/callback`：GitHub 回调
  - 取 code 参数，调用 `oauthService.handleGithubCallback(code)`
  - 签发 JWT token，重定向到前端 `/#/oauth-callback?token=xxx&user=xxx`
- 新增 `GET /auth/wechat`：重定向到微信授权页
  - 拼接微信 authorize URL + appid + redirect_uri + scope(snsapi_userinfo)
- 新增 `GET /auth/wechat/callback`：微信回调
  - 取 code 参数，调用 `oauthService.handleWechatCallback(code)`
  - 签发 JWT token，重定向到前端 `/#/oauth-callback?token=xxx&user=xxx`

---

## Task 9: 后端 - 注册 AuthModule providers 和 entities

修改 `packages/backend/src/modules/auth/auth.module.ts`：
- 在 `providers` 中添加 `CaptchaService`、`CryptoService`、`OAuthService`
- 在 `imports` 中为 AuthModule 添加 `TypeOrmModule.forFeature([OAuthAccount])`
- 环境变量：`GITHUB_CLIENT_ID`、`GITHUB_CLIENT_SECRET`、`GITHUB_CALLBACK_URL`、`WECHAT_APP_ID`、`WECHAT_APP_SECRET`、`WECHAT_CALLBACK_URL`

---

## Task 10: 前端 - 安装 jsencrypt 依赖

```bash
cd packages/frontend && pnpm add jsencrypt
```
用于前端 RSA 公钥加密密码。

---

## Task 11: 前端 - 修改 auth store

修改 `packages/frontend/src/stores/auth.ts`：
- `login()` 方法增加 `captchaId` 和 `captchaCode` 参数，请求体中携带
- `register()` 方法保持 `username` + `password` + `email` 参数
- 密码加密在 LoginView.vue 组件层完成，store 仍接收已加密的密码字符串
- 新增 `oauthLogin(token, user)` 方法：用于 OAuth 回调页面接收 token 和 user 信息

---

## Task 12: 前端 - 新增 OAuth 回调页面

新建 `packages/frontend/src/views/login/OauthCallback.vue`：
- 解析 URL 中的 token 和 user 参数
- 调用 `auth.oauthLogin(token, user)` 写入登录状态
- 跳转到 `/dashboard`
- 错误处理：token 无效则跳回登录页并提示

在路由中注册 `/oauth-callback` 路由

---

## Task 13: 前端 - 修改 LoginView.vue

修改 `packages/frontend/src/views/login/LoginView.vue`：

**Script 部分：**
- 将 `email` ref 改为 `username` ref
- 新增 `captchaCode` ref、`captchaId` ref、`captchaSvg` ref
- 新增 `publicKey` ref，页面加载时通过 `GET /auth/public-key` 获取
- 删除 `validateEmail` / `onEmailInput` 等邮箱相关逻辑
- 新增 `fetchCaptcha()` 方法：调用 `request.get('/auth/captcha')`
- `onMounted` 时调用 `fetchCaptcha()` 和获取公钥
- 点击验证码图片时重新调用 `fetchCaptcha()`
- 登录时用 JSEncrypt + publicKey 加密密码，再调用 `auth.login()`
- 新增注册表单切换逻辑（点击"立即申请"切换到注册表单）
- 注册表单字段：用户名 + 邮箱 + 密码 + 确认密码
- 注册时同样用 RSA 加密密码后提交

**Template 部分：**
- 将 "工作邮箱" 输入框改为 "用户名" 输入框
- 在密码输入框下方新增验证码字段：
  - 左侧：验证码输入框
  - 右侧：验证码图片（显示 svg，可点击刷新）
- OAuth 按钮区域修改：将 Google/SSO 替换为微信和 GitHub
  - 微信按钮：点击跳转 `/api/auth/wechat`（绿色图标）
  - GitHub 按钮：点击跳转 `/api/auth/github`（深色图标）
- 登录/注册表单切换：
  - 登录表单：用户名 + 密码 + 验证码 + 登录按钮
  - 注册表单：用户名 + 邮箱 + 密码 + 确认密码 + 注册按钮
  - 底部文字："还没有账户？立即申请" / "已有账户？返回登录"

---

## 涉及文件汇总

| 文件 | 操作 |
|------|------|
| `packages/backend/package.json` | 添加 svg-captcha、passport-github2 依赖 |
| `packages/backend/src/modules/auth/entities/oauth-account.entity.ts` | **新建** - OAuth 关联实体 |
| `packages/backend/src/modules/auth/captcha.service.ts` | **新建** - 验证码服务 |
| `packages/backend/src/modules/auth/crypto.service.ts` | **新建** - RSA 密码加解密服务 |
| `packages/backend/src/modules/auth/oauth.service.ts` | **新建** - OAuth 登录服务（微信+GitHub） |
| `packages/backend/src/modules/auth/auth.controller.ts` | 修改 - 新增 captcha/public-key/github/wechat 接口 + login 验证码校验 + 密码解密 |
| `packages/backend/src/modules/auth/auth.service.ts` | 修改 - register 邮箱必填 |
| `packages/backend/src/modules/auth/auth.module.ts` | 修改 - 注册 CaptchaService + CryptoService + OAuthService + OAuthAccount 实体 |
| `packages/frontend/package.json` | 添加 jsencrypt 依赖 |
| `packages/frontend/src/stores/auth.ts` | 修改 - login 增加验证码参数 + oauthLogin 方法 |
| `packages/frontend/src/views/login/LoginView.vue` | 修改 - 用户名登录 + 验证码 + 注册表单 + RSA 加密 + 微信/GitHub 按钮 |
| `packages/frontend/src/views/login/OauthCallback.vue` | **新建** - OAuth 回调页面 |
| `packages/frontend/src/router/index.ts` | 修改 - 新增 /oauth-callback 路由 |

## 环境变量

后端 `.env` 需新增：
```
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_CALLBACK_URL=http://localhost:3000/api/auth/github/callback
WECHAT_APP_ID=your_wechat_app_id
WECHAT_APP_SECRET=your_wechat_app_secret
WECHAT_CALLBACK_URL=http://localhost:3000/api/auth/wechat/callback
```
