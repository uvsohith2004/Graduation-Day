import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';

@Injectable()
export class ConfigService {
  constructor(private nestConfigService: NestConfigService) {}
  getCronSecret(): string {
    const cronSecret = this.nestConfigService.get<string>('CRON_SECRET');
    if (!cronSecret) {
      throw new Error('CRON_SECRET environment variable is not set!');
    }
    return cronSecret;
  }
  getRecipients(): string {
    const recipients = this.nestConfigService.get<string>('RECIPIENTS');
    if (!recipients) {
      throw new Error('RECIPIENTS environment variable is not set!');
    }
    return recipients;
  }
  getSpreadsheetId(): string {
    return (
      this.nestConfigService.get<string>('SPREADSHEET_ID') ||
      this.getGraduationSpreadsheetId()
    );
  }

  getGraduationSpreadsheetId(): string {
    return (
      this.nestConfigService.get<string>('GRADUATION_SPREADSHEET_ID') ||
      '1nSK3VmRhyEPPg-6gsBVQez-N0NVU6s0mRdFgpCW2i-k'
    );
  }

  getGraduationSheetName(): string | undefined {
    return this.nestConfigService.get<string>('GRADUATION_SHEET_NAME');
  }

  getGoogleCredentials(): Record<string, any> {
    const base64String =
      this.nestConfigService.get<string>('GOOGLE_CRED_BASE64');

    if (!base64String) {
      throw new Error('GOOGLE_CRED_BASE64 environment variable is not set!');
    }

    try {
      const decodedBuffer = Buffer.from(base64String, 'base64');
      const jsonString = decodedBuffer.toString('utf-8');
      return JSON.parse(jsonString);
    } catch {
      throw new Error('Failed to decode or parse GOOGLE_CRED_BASE64.');
    }
  }

  getEmail(): string {
    const email = this.nestConfigService.get<string>('GMAIL_USER');
    if (!email) {
      throw new Error('EMAIL environment variable is not set!');
    }
    return email;
  }
  getEmailPassword(): string {
    const password = this.nestConfigService.get<string>('GMAIL_APP_PASSWORD');
    if (!password) {
      throw new Error('EMAIL_PASSWORD environment variable is not set!');
    }
    return password;
  }
  getBaseUrl(): string {
    const baseUrl = this.nestConfigService.get<string>('BASE_URL');
    if (!baseUrl) {
      throw new Error('BASE_URL environment variable is not set!');
    }
    return baseUrl;
  }
  getAuthSecret(): string {
    const authSecret = this.nestConfigService.get<string>('AUTH_SECRET');
    if (!authSecret) {
      throw new Error('AUTH_SECRET environment variable is not set!');
    }
    return authSecret;
  }
  getWebUrl(): string {
    const webUrl = this.nestConfigService.get<string>('WEB_URL');
    if (!webUrl) {
      throw new Error('WEB_URL environment variable is not set!');
    }
    return webUrl;
  }
  getGoogleClientId(): string {
    const googleClientId = this.nestConfigService.get<string>('GOOGLE_CLIENT_ID');
    if (!googleClientId) {
      throw new Error('GOOGLE_CLIENT_ID environment variable is not set!');
    }
    return googleClientId;
  }
  getGoogleClientSecret(): string {
    const googleClientSecret = this.nestConfigService.get<string>('GOOGLE_CLIENT_SECRET');
    if (!googleClientSecret) {
      throw new Error('GOOGLE_CLIENT_SECRET environment variable is not set!');
    }
    return googleClientSecret;
  }
  getPort(): number {
    const port = this.nestConfigService.get<number>('PORT');
    if (!port) {
      throw new Error('PORT environment variable is not set!');
    }
    return port;
  }
  getNodeEnv(): string | undefined {
    return this.nestConfigService.get<string>('NODE_ENV');
  }
  getDatabaseUrl(): string {
    const databaseUrl = this.nestConfigService.get<string>('DATABASE_URL');
    if (!databaseUrl) {
      throw new Error('DATABASE_URL environment variable is not set!');
    }
    return databaseUrl;
  }
}
