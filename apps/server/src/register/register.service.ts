import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common';
import { InjectDB } from '../database/inject-db.decorator';
import { alumni, eligibility } from 'src/database/schemas';
import { eq } from 'drizzle-orm';
import { CreateAlumniDto } from './dto/create-alumni.dto';

@Injectable()
export class RegisterService {
  constructor(@InjectDB() private readonly db) {}

  async createAlumni(userId: string, email: string, payload: CreateAlumniDto) {
    try {
      
      const existingUser = await this.db.query.alumni.findFirst({
        where: eq(alumni.userId, userId),
      });
      if (existingUser) {
        throw new HttpException("You have already registered.", HttpStatus.CONFLICT);
      }


      const existingRoll = await this.db.query.alumni.findFirst({
        where: eq(alumni.hall_ticket_number, payload.hallTicketNumber),
      });
      if (existingRoll) {
        throw new HttpException("This roll number has already been registered.", HttpStatus.CONFLICT);
      }

      await this.db.insert(alumni).values({
        id: crypto.randomUUID(), 
        userId,
        email,
        student_name: payload.studentName,
        mobile_number: payload.mobileNumber,
        branch: payload.branch,
        hall_ticket_number: payload.hallTicketNumber,
        will_attend: payload.willAttend === 'Yes',
        guest_count: payload.numberOfGuests,
        photo: payload.photo,
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error creating alumni:', error);
      throw error;
    }
  }

  async getTicket(userId: string, email: string) {
    const result = await this.db.query.alumni.findFirst({
      where: eq(alumni.userId, userId),
    });
    return result;
  }
  async checkEligibility(rollNo: string) {
    const existingRoll = await this.db.query.alumni.findFirst({
      where: eq(alumni.hall_ticket_number, rollNo.toUpperCase()),
    });
    if (existingRoll) {
      throw new HttpException("This roll number has already been registered.", HttpStatus.CONFLICT);
    }
    const allowedHallTicketNumber = await this.db.query.eligibility.findFirst({
      where: eq(eligibility.rollNumber, rollNo.toUpperCase()),
    });
    if(!allowedHallTicketNumber){
      throw new HttpException("This roll number isn't on the list.", HttpStatus.BAD_REQUEST);
    }
    return { eligible: true };
  }
}
