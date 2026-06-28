import { Injectable } from '@nestjs/common';
import { db } from '../database/db';
import { contactMessages } from '../database/schemas';

@Injectable()
export class ContactService {
  async createMessage(userId: string, email: string, name: string, message: string) {
    await db.insert(contactMessages).values({
      id: crypto.randomUUID(),
      userId,
      email,
      name,
      message,
    });
    return { success: true };
  }
}
