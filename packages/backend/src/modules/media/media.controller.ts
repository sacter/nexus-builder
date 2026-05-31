import { Controller, Get, Post, Delete, Param, Query, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { MediaService } from './media.service'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { CurrentUser } from '../../common/decorators/current-user.decorator'
import { diskStorage } from 'multer'
import { extname } from 'path'

@Controller('media')
@UseGuards(JwtAuthGuard)
export class MediaController {
  constructor(private mediaService: MediaService) {}

  @Get()
  findAll(@Query('page') page = 1, @Query('pageSize') pageSize = 20) {
    return this.mediaService.findAll(+page, +pageSize)
  }

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (_req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
          cb(null, uniqueSuffix + extname(file.originalname))
        },
      }),
    }),
  )
  upload(@UploadedFile() file: Express.Multer.File, @CurrentUser('id') userId: string) {
    return this.mediaService.create(file, userId)
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.mediaService.delete(id)
  }
}
