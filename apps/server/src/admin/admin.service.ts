import { Injectable } from '@nestjs/common';
import { db } from '../database/db';
import { alumni, eligibility, user, session, otpCodes, contactMessages, adminAuditLogs, branchesTable, importErrors, ticketTemplate } from '../database/schemas';
import { notInArray, eq, count, sql } from 'drizzle-orm';
import * as nodemailer from 'nodemailer';

@Injectable()
export class AdminService {
  private transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  private branchesCache: any[] | null = null;

  async getAllBranches() {
    if (this.branchesCache) {
      return this.branchesCache;
    }
    const branches = await db.select().from(branchesTable);
    this.branchesCache = branches;
    return branches;
  }

  async createBranch(data: { name: string; venue: string; date: string; time: string }) {
    await db.insert(branchesTable).values({
      id: crypto.randomUUID(),
      name: data.name,
      venue: data.venue,
      date: data.date,
      time: data.time,
    });
    this.branchesCache = null; // Invalidate cache
    return { success: true };
  }

  async updateBranch(id: string, data: { name: string; venue: string; date: string; time: string }) {
    await db.update(branchesTable).set({
      name: data.name,
      venue: data.venue,
      date: data.date,
      time: data.time,
    }).where(eq(branchesTable.id, id));
    this.branchesCache = null; // Invalidate cache
    return { success: true };
  }

  async deleteBranch(id: string) {
    await db.delete(branchesTable).where(eq(branchesTable.id, id));
    this.branchesCache = null; // Invalidate cache
    return { success: true };
  }

  async deleteRegistration(id: string) {
    await db.delete(alumni).where(eq(alumni.id, id));
    return { success: true };
  }

  async deleteEligibility(rollNo: string) {
    await db.delete(eligibility).where(eq(eligibility.rollNumber, rollNo));
    return { success: true };
  }

  async addEligibility(data: { rollNumber: string; studentName: string; branch: string }) {
    await db.insert(eligibility).values({
      rollNumber: data.rollNumber,
      studentName: data.studentName,
      branch: data.branch,
    });
    return { success: true };
  }

  async importEligibility(rows: any[], branch: string) {
    const dataToProcess = rows.map((row) => {
      return {
        rollNumber: String(row.rollNumber || row['Roll Number'] || row.rollNo || row.RollNo || '').trim(),
        studentName: String(row.studentName || row.Name || row.student_name || row['Student Name'] || '').trim(),
        branch,
      };
    });
    
    let successCount = 0;
    
    for (const data of dataToProcess) {
      if (!data.rollNumber || !data.studentName) {
        await db.insert(importErrors).values({
          id: crypto.randomUUID(),
          rollNumber: data.rollNumber || 'N/A',
          studentName: data.studentName || 'N/A',
          branch: data.branch,
          errorReason: 'Missing roll number or student name',
        });
        continue;
      }
      
      try {
        await db.insert(eligibility).values({
          rollNumber: data.rollNumber,
          studentName: data.studentName,
          branch: data.branch,
        });
        successCount++;
      } catch (error: any) {
        await db.insert(importErrors).values({
          id: crypto.randomUUID(),
          rollNumber: data.rollNumber,
          studentName: data.studentName,
          branch: data.branch,
          errorReason: error.message || 'Unknown database error (likely duplicate)',
        });
      }
    }

    return { success: true, count: successCount, total: dataToProcess.length };
  }

  async getImportErrors() {
    return db.select().from(importErrors).orderBy(sql`${importErrors.createdAt} DESC`);
  }

  async clearImportErrors() {
    await db.delete(importErrors);
    return { success: true };
  }

  async getOverviewStats() {
    const allRegistered = await db.select().from(alumni);
    const registeredRollNos = allRegistered.map(r => r.hall_ticket_number);

    const allEligible = await db.select().from(eligibility);

    const branchMap: Record<string, { registered: number; unregistered: number; total: number }> = {};

    for (const e of allEligible) {
      if (!branchMap[e.branch]) {
        branchMap[e.branch] = { registered: 0, unregistered: 0, total: 0 };
      }
      branchMap[e.branch].total++;
      if (registeredRollNos.includes(e.rollNumber)) {
        branchMap[e.branch].registered++;
      } else {
        branchMap[e.branch].unregistered++;
      }
    }

    const totalUsersResult = await db.select({ value: count() }).from(user);
    const totalSessionsResult = await db.select({ value: count() }).from(session);

    return {
      branches: branchMap,
      totalRegistered: allRegistered.length,
      totalEligible: allEligible.length,
      totalUnregistered: allEligible.length - allRegistered.length,
      totalUsers: totalUsersResult[0]?.value || 0,
      totalLogins: totalSessionsResult[0]?.value || 0,
    };
  }

  async getBranchData(branch: string, type: 'registered' | 'unregistered') {
    if (type === 'registered') {
      const results = await db.select().from(alumni).where(eq(alumni.branch, branch));
      return results;
    }

    const registeredInBranch = await db.select({ rollNo: alumni.hall_ticket_number }).from(alumni).where(eq(alumni.branch, branch));
    const registeredRollNos = registeredInBranch.map(r => r.rollNo);

    if (registeredRollNos.length > 0) {
      return db
        .select()
        .from(eligibility)
        .where(
          sql`${eligibility.branch} = ${branch} AND ${eligibility.rollNumber} NOT IN (${sql.join(registeredRollNos.map(r => sql`${r}`), sql`, `)})`
        );
    }

    return db.select().from(eligibility).where(eq(eligibility.branch, branch));
  }

  async getAllUsers() {
    const users = await db.select({
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      role: user.role,
      createdAt: user.createdAt,
    }).from(user);
    return users;
  }

  async sendOtp(adminUserId: string, targetUserId: string) {
    const targetUser = await db.select().from(user).where(eq(user.id, targetUserId));
    if (!targetUser.length) {
      throw new Error('User not found');
    }

    if (targetUser[0].role === 'admin') {
      throw new Error('User is already an admin');
    }

    const adminUser = await db.select().from(user).where(eq(user.id, adminUserId));
    if (!adminUser.length) {
      throw new Error('Admin not found');
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await db.insert(otpCodes).values({
      id: crypto.randomUUID(),
      adminUserId,
      targetUserId,
      code,
      expiresAt,
    });

    await this.transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: adminUser[0].email,
      subject: 'VITS Alumni Hub - Admin Role Verification',
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
          <h2 style="margin-bottom: 8px;">Admin Role Verification</h2>
          <p>You are authorizing the promotion of <b>${targetUser[0].name} (${targetUser[0].email})</b> to admin.</p>
          <p>Your verification code is:</p>
          <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; text-align: center; padding: 24px; background: #f4f4f5; border-radius: 12px; margin: 16px 0;">
            ${code}
          </div>
          <p style="color: #71717a; font-size: 14px;">This code expires in 10 minutes.</p>
        </div>
      `,
    });

    return { sent: true };
  }

  async verifyOtpAndPromote(adminUserId: string, targetUserId: string, code: string) {
    const otpRecord = await db
      .select()
      .from(otpCodes)
      .where(
        sql`${otpCodes.targetUserId} = ${targetUserId} AND ${otpCodes.adminUserId} = ${adminUserId} AND ${otpCodes.code} = ${code} AND ${otpCodes.expiresAt} > NOW()`
      );

    if (!otpRecord.length) {
      throw new Error('Invalid or expired OTP');
    }

    await db.update(user).set({ role: 'admin' }).where(eq(user.id, targetUserId));

    await db.insert(adminAuditLogs).values({
      id: crypto.randomUUID(),
      adminUserId,
      targetUserId,
      action: 'promoted_to_admin',
    });

    await db.delete(otpCodes).where(eq(otpCodes.targetUserId, targetUserId));

    return { promoted: true };
  }

  async getContactMessages() {
    return db.select().from(contactMessages).orderBy(sql`${contactMessages.createdAt} DESC`);
  }

  async replyToContactMessage(messageId: string, subject: string, body: string) {
    const messageRecord = await db.select().from(contactMessages).where(eq(contactMessages.id, messageId));
    if (!messageRecord.length) {
      throw new Error('Contact message not found');
    }

    const { email, name, message } = messageRecord[0];

    await this.transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: email,
      subject: subject,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; border: 1px solid #e5e7eb; border-radius: 12px;">
          <h2 style="color: #09090b; margin-bottom: 24px;">Response to your inquiry</h2>
          
          <div style="margin-bottom: 24px;">
            ${body.replace(/\n/g, '<br/>')}
          </div>

          <div style="padding: 16px; background-color: #f4f4f5; border-left: 4px solid #d4d4d8; border-radius: 4px; margin-top: 32px;">
            <p style="margin: 0 0 8px 0; font-size: 14px; font-weight: bold; color: #52525b;">Your Original Message:</p>
            <p style="margin: 0; font-size: 14px; color: #71717a; font-style: italic;">"${message}"</p>
          </div>
          
          <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #a1a1aa; text-align: center;">
            <p>VITS Alumni Hub Team</p>
          </div>
        </div>
      `,
    });

    await db.update(contactMessages).set({ isReplied: true }).where(eq(contactMessages.id, messageId));

    return { success: true };
  }

  async getDashboardStats() {
    const registered = await db.select().from(alumni);
    const registeredRollNos = registered.map(r => r.hall_ticket_number);

    const unregistered = registeredRollNos.length > 0
      ? await db.select().from(eligibility).where(notInArray(eligibility.rollNumber, registeredRollNos))
      : await db.select().from(eligibility);

    return { registered, unregistered };
  }

  async getTemplate() {
    const template = await db.query.ticketTemplate.findFirst({
      where: eq(ticketTemplate.id, 'default')
    });
    return template || null;
  }

  async saveTemplate(data: { bgImageUrl: string; config: any }) {
    await db.insert(ticketTemplate).values({
      id: 'default',
      bgImageUrl: data.bgImageUrl,
      config: data.config,
    }).onConflictDoUpdate({
      target: ticketTemplate.id,
      set: {
        bgImageUrl: data.bgImageUrl,
        config: data.config,
        updatedAt: sql`now()`
      }
    });
    return { success: true };
  }
}
