import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Page } from './entities/page.entity'
import { PageSchema } from './entities/page-schema.entity'
import { PageService } from './page.service'
import { PageController } from './page.controller'

@Module({
  imports: [TypeOrmModule.forFeature([Page, PageSchema])],
  controllers: [PageController],
  providers: [PageService],
  exports: [PageService],
})
export class PageModule {}
