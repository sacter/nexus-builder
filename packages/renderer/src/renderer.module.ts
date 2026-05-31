import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { PageSchema } from './entities/page-schema.entity'
import { Page } from './entities/page.entity'
import { PageRendererService } from './services/page-renderer.service'
import { RendererController } from './renderer.controller'

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
        synchronize: false, // Renderer 只读，不建表
        logging: false,
      }),
    }),
    TypeOrmModule.forFeature([Page, PageSchema]),
  ],
  controllers: [RendererController],
  providers: [PageRendererService],
})
export class RendererModule {}
