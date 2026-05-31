import 'reflect-metadata'
import { NestFactory } from '@nestjs/core'
import { RendererModule } from './renderer.module'

async function bootstrap() {
  const app = await NestFactory.create(RendererModule)
  app.enableCors({ origin: true })
  const port = process.env.RENDERER_PORT ?? 3001
  await app.listen(port)
  console.log(`Renderer running on http://localhost:${port}`)
}
bootstrap()
