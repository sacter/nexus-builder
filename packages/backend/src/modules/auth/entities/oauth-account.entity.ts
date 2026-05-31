import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm'
import { User } from '../../user/entities/user.entity'

@Entity('oauth_accounts')
@Index(['provider', 'providerId'], { unique: true })
export class OAuthAccount {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ length: 20 })
  provider: string // 'github' | 'wechat'

  @Column({ name: 'provider_id', length: 100 })
  providerId: string // 第三方用户 ID

  @Column({ name: 'provider_username', length: 100, nullable: true })
  providerUsername: string // 第三方用户名

  @Column({ name: 'access_token', length: 500, nullable: true })
  accessToken: string

  @Column({ name: 'avatar_url', length: 500, nullable: true })
  avatarUrl: string // 第三方头像

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User

  @Column({ name: 'user_id' })
  userId: string

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date
}
