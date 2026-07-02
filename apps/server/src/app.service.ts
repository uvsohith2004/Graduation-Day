import { Injectable } from '@nestjs/common';
import { db } from './database/db';
import { ticketTemplate } from './database/schemas/template.schema';
import { branchesTable } from './database/schemas/branch.schema';
import { settings } from './database/schemas/settings.schema';
import { eq, asc } from 'drizzle-orm';

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

  async getPublicBranches() {
    return await db.query.branchesTable.findMany({
      orderBy: [asc(branchesTable.date), asc(branchesTable.time)]
    });
  }

  async getPublicSettings() {
    const config = await db.query.settings.findFirst({
      where: eq(settings.id, 'default')
    });
    return config || { isRegistrationOpen: true };
  }
}

