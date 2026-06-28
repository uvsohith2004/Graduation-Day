import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import express from 'express';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bodyParser: false,
  });
  
  app.set('trust proxy', 1);

  const webOrigin = process.env.WEB_URL || 'http://localhost:5173';

  // Enable CORS globally FIRST so preflight requests work for auth routes
  app.enableCors({
    origin: [webOrigin, 'https://graduation-day-web.vercel.app', 'https://pbrvits-graduation-day.vercel.app'],
    credentials: true,
  });

  // Mount Better Auth as raw Express middleware BEFORE NestJS touches requests.
  // This ensures cookies are set directly on the raw response object,
  // which is critical for Vercel Serverless.
  const betterAuthInstance = app.get('BETTER_AUTH');
  const { toNodeHandler } = await import('better-auth/node');
  const authHandler = toNodeHandler(betterAuthInstance);

  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.all('/api/auth/*', (req: any, res: any) => {
    return authHandler(req, res);
  });

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
