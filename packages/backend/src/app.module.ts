import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AuthModule } from './modules/auth/auth.module'
import { UserModule } from './modules/user/user.module'
import { RoleModule } from './modules/role/role.module'
import { ApplicationModule } from './modules/application/application.module'
import { PageModule } from './modules/page/page.module'
import { DatasourceModule } from './modules/datasource/datasource.module'
import { ComponentModule } from './modules/component/component.module'
import { WorkflowModule } from './modules/workflow/workflow.module'
import { MediaModule } from './modules/media/media.module'
import { HealthModule } from './modules/health/health.module'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mysql',
        host: config.get('DB_HOST', 'localhost'),
        port: config.get('DB_PORT', 3306),
        username: config.get('DB_USER', 'lowcode'),
        password: config.get('DB_PASSWORD', 'lowcode123'),
        database: config.get('DB_NAME', 'lowcode'),
        autoLoadEntities: true,
        synchronize: config.get('DB_SYNC', 'true') === 'true',
        logging: config.get('NODE_ENV') === 'development',
      }),
    }),
    AuthModule,
    UserModule,
    RoleModule,
    ApplicationModule,
    PageModule,
    DatasourceModule,
    ComponentModule,
    WorkflowModule,
    MediaModule,
    HealthModule,
  ],
})
export class AppModule {}
