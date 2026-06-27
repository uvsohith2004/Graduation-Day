import { Injectable } from '@nestjs/common';
import { db } from '../database/db';
import { alumni, eligibility } from '../database/schemas';
import { notInArray, eq } from 'drizzle-orm';

@Injectable()
export class AdminService {
  async getDashboardStats() {
    // 1. Fetch all registered alumni
    const registered = await db.select().from(alumni);
    
    // 2. Fetch all unregistered eligible alumni
    // First get all registered roll numbers
    const registeredRollNos = registered.map(r => r.hall_ticket_number);

    const unregistered = registeredRollNos.length > 0
      ? await db.select().from(eligibility).where(notInArray(eligibility.rollNumber, registeredRollNos))
      : await db.select().from(eligibility);

    return {
      registered,
      unregistered
    };
  }
}
