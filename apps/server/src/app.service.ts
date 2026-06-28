import { Injectable } from '@nestjs/common';
import { db } from './database/db';
import { ticketTemplate } from './database/schemas/template.schema';
import { eq } from 'drizzle-orm';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  async getPublicTemplate() {
    const template = await db.query.ticketTemplate.findFirst({
      where: eq(ticketTemplate.id, 'default')
    });
    return template || null;
  }
}
