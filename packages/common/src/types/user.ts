export interface IUser {
  id: string
  username: string
  email?: string
  avatarUrl?: string
  status: UserStatus
  createdAt: string
  updatedAt: string
  roles?: IRole[]
}

export enum UserStatus {
  ACTIVE = 1,
  DISABLED = 0,
}

export interface IRole {
  id: string
  name: string
  description?: string
  permissions?: IPermission[]
  createdAt: string
}

export interface IPermission {
  id: string
  resource: string
  action: string
}

export interface ILoginRequest {
  username: string
  password: string
}

export interface ILoginResponse {
  accessToken: string
  refreshToken: string
  user: IUser
}
