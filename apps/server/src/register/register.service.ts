import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common';
import { InjectDB } from '../database/inject-db.decorator';
import { alumni, eligibility, branchesTable } from '../database/schemas';
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
        throw new HttpException(
          'You have already registered.',
          HttpStatus.CONFLICT,
        );
      }

      const existingRoll = await this.db.query.alumni.findFirst({
        where: eq(alumni.hall_ticket_number, payload.hallTicketNumber),
      });
      if (existingRoll) {
        throw new HttpException(
          'This roll number has already been registered.',
          HttpStatus.CONFLICT,
        );
      }

      const eventDetails = await this.db.query.branchesTable.findFirst({
        where: eq(branchesTable.name, payload.branch),
      });
      
      if (!eventDetails) {
        throw new HttpException(
          'Invalid branch selected.',
          HttpStatus.BAD_REQUEST,
        );
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
        event_date: eventDetails.date,
        event_time: eventDetails.time,
        venue: eventDetails.venue,
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
      throw new HttpException(
        'This roll number has already been registered.',
        HttpStatus.CONFLICT,
      );
    }
    const allowedHallTicketNumber = await this.db.query.eligibility.findFirst({
      where: eq(eligibility.rollNumber, rollNo.toUpperCase()),
    });
    if (!allowedHallTicketNumber) {
      throw new HttpException(
        "This roll number isn't on the list.",
        HttpStatus.BAD_REQUEST,
      );
    }
    return { 
      eligible: true,
      studentName: allowedHallTicketNumber.studentName,
      branch: allowedHallTicketNumber.branch 
    };
  }

  async updateTicket(userId: string, payload: any) {
    const existingUser = await this.db.query.alumni.findFirst({
      where: eq(alumni.userId, userId),
    });

    if (!existingUser) {
      throw new HttpException('Registration not found.', HttpStatus.NOT_FOUND);
    }

    const updateData: any = {};
    if (payload.studentName !== undefined) updateData.student_name = payload.studentName;
    if (payload.mobileNumber !== undefined) updateData.mobile_number = payload.mobileNumber;
    if (payload.willAttend !== undefined) updateData.will_attend = payload.willAttend === 'Yes' || payload.willAttend === true;
    if (payload.numberOfGuests !== undefined) updateData.guest_count = payload.numberOfGuests;

    if (payload.branch && payload.branch !== existingUser.branch) {
      const eventDetails = await this.db.query.branchesTable.findFirst({
        where: eq(branchesTable.name, payload.branch),
      });
      if (!eventDetails) {
        throw new HttpException('Invalid branch selected.', HttpStatus.BAD_REQUEST);
      }
      updateData.branch = payload.branch;
      updateData.event_date = eventDetails.date;
      updateData.event_time = eventDetails.time;
      updateData.venue = eventDetails.venue;
    }

    if (payload.photo) {
      if (!existingUser.can_edit_photo) {
        throw new HttpException('You do not have permission to edit the photo.', HttpStatus.FORBIDDEN);
      }
      updateData.photo = payload.photo;
      updateData.can_edit_photo = false;
      updateData.photo_edit_request = false;
    }

    if (Object.keys(updateData).length === 0) {
      return { success: true, message: 'No changes detected.' };
    }

    await this.db.update(alumni).set(updateData).where(eq(alumni.userId, userId));
    return { success: true };
  }

  async requestPhotoEdit(userId: string) {
    const existingUser = await this.db.query.alumni.findFirst({
      where: eq(alumni.userId, userId),
    });

    if (!existingUser) {
      throw new HttpException('Registration not found.', HttpStatus.NOT_FOUND);
    }

    await this.db.update(alumni).set({ photo_edit_request: true }).where(eq(alumni.userId, userId));
    return { success: true };
  }
}
