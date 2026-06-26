import { Module, Global } from '@nestjs/common';
import { ConfigService } from './config.service';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import * as Joi from 'joi';

@Global()
@Module({
  imports: [
    NestConfigModule.forRoot({
      validationSchema: Joi.object({
        GMAIL_USER: Joi.string().optional().allow(''),
        GMAIL_APP_PASSWORD: Joi.string().optional().allow(''),
        SPREADSHEET_ID: Joi.string().optional().allow(''),
        GOOGLE_CRED_BASE64: Joi.string().optional().allow(''),
        RECIPIENTS: Joi.string().optional().allow(''),
        AUTH_SECRET: Joi.string().required(),
        BASE_URL: Joi.string().required(),
        WEB_URL: Joi.string().required(),
        GOOGLE_CLIENT_ID: Joi.string().required(),
        GOOGLE_CLIENT_SECRET: Joi.string().required(),
        PORT: Joi.number().optional().default(3000),
        NODE_ENV: Joi.string().optional(),
        DATABASE_URL: Joi.string().required(),
      }),
    }),
  ],
  providers: [ConfigService],
  exports: [ConfigService],
})
export class ConfigModule {}
