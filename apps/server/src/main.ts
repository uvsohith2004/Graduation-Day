import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import express from 'express';
import { NestExpressApplication } from '@nestjs/platform-express';

let cachedServer: express.Application;

async function bootstrap() {
  if (!cachedServer) {
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
    const betterAuthInstance = app.get('BETTER_AUTH');
    const { toNodeHandler } = await import('better-auth/node');
    const authHandler = toNodeHandler(betterAuthInstance);

    const expressApp = app.getHttpAdapter().getInstance();
    
    expressApp.use('/api/auth/*', (req: any, res: any, next: any) => {
      const origin = req.headers.origin;
      const allowedOrigins = [webOrigin, 'https://graduation-day-web.vercel.app', 'https://pbrvits-graduation-day.vercel.app'];
      if (origin && allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
      }
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept, Authorization');
      
      if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
      }
      next();
    });

    expressApp.all('/api/auth/*', (req: any, res: any) => {
      return authHandler(req, res);
    });

    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    await app.init();
    cachedServer = expressApp;
  }
  return cachedServer;
}

// For local development or non-serverless environments
if (process.env.NODE_ENV !== 'production' || process.env.START_SERVER === 'true') {
  bootstrap().then(server => {
    server.listen(process.env.PORT ?? 3000, () => {
      console.log(`Server listening on port ${process.env.PORT ?? 3000}`);
    });
  });
}

// Required for Vercel Serverless to handle requests
export default async function handler(req: any, res: any) {
  const server = await bootstrap();
  return server(req, res);
}
