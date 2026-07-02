import { Controller, Get, Post, Delete, Param, Body, Query, UseGuards, HttpException, HttpStatus, Put } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Session } from '../auth/session.decorator';

@Controller('admin')
@UseGuards(AuthGuard, RolesGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard-stats')
  async getStats() {
    return this.adminService.getDashboardStats();
  }

  @Get('overview')
  async getOverview() {
    return this.adminService.getOverviewStats();
  }

  @Get('branch-data')
  async getBranchData(
    @Query('branch') branch: string,
    @Query('type') type: 'registered' | 'unregistered',
  ) {
    if (!branch || !type) {
      throw new HttpException('branch and type query params required', HttpStatus.BAD_REQUEST);
    }
    return this.adminService.getBranchData(branch, type);
  }

  @Get('users')
  async getAllUsers() {
    return this.adminService.getAllUsers();
  }

  @Post('send-otp')
  async sendOtp(@Session() session: any, @Body('targetUserId') targetUserId: string) {
    if (!targetUserId) {
      throw new HttpException('targetUserId is required', HttpStatus.BAD_REQUEST);
    }
    try {
      return await this.adminService.sendOtp(session.user.id, targetUserId);
    } catch (error: any) {
      throw new HttpException(error.message || 'Failed to send OTP', HttpStatus.BAD_REQUEST);
    }
  }

  @Post('verify-otp')
  async verifyOtp(
    @Session() session: any,
    @Body('targetUserId') targetUserId: string,
    @Body('code') code: string,
  ) {
    if (!targetUserId || !code) {
      throw new HttpException('targetUserId and code are required', HttpStatus.BAD_REQUEST);
    }
    try {
      return await this.adminService.verifyOtpAndPromote(session.user.id, targetUserId, code);
    } catch (error: any) {
      throw new HttpException(error.message || 'Verification failed', HttpStatus.BAD_REQUEST);
    }
  }

  @Get('contact-messages')
  async getContactMessages() {
    return this.adminService.getContactMessages();
  }

  @Post('contact-messages/reply')
  async replyToContactMessage(
    @Body('messageId') messageId: string,
    @Body('subject') subject: string,
    @Body('body') body: string,
  ) {
    if (!messageId || !subject || !body) {
      throw new HttpException('messageId, subject, and body are required', HttpStatus.BAD_REQUEST);
    }
    try {
      return await this.adminService.replyToContactMessage(messageId, subject, body);
    } catch (error: any) {
      throw new HttpException(error.message || 'Failed to send reply', HttpStatus.BAD_REQUEST);
    }
  }

  // --- New Routes for dynamic branches and deletion ---

  @Get('branches')
  async getBranches() {
    return this.adminService.getAllBranches();
  }

  @Post('branches')
  async createBranch(@Body() data: { name: string; venue: string; date: string; time: string }) {
    if (!data.name || !data.venue || !data.date || !data.time) {
      throw new HttpException('Missing branch fields', HttpStatus.BAD_REQUEST);
    }
    return this.adminService.createBranch(data);
  }

  @Put('branches/:id')
  async updateBranch(
    @Param('id') id: string,
    @Body() data: { name: string; venue: string; date: string; time: string }
  ) {
    if (!data.name || !data.venue || !data.date || !data.time) {
      throw new HttpException('Missing branch fields', HttpStatus.BAD_REQUEST);
    }
    return this.adminService.updateBranch(id, data);
  }

  @Delete('branches/:id')
  async deleteBranch(@Param('id') id: string) {
    return this.adminService.deleteBranch(id);
  }

  @Delete('registration/:id')
  async deleteRegistration(@Param('id') id: string) {
    return this.adminService.deleteRegistration(id);
  }

  @Delete('eligibility/:rollNo')
  async deleteEligibility(@Param('rollNo') rollNo: string) {
    return this.adminService.deleteEligibility(rollNo);
  }

  @Post('eligibility')
  async addEligibility(@Body() data: { rollNumber: string; studentName: string; branch: string }) {
    if (!data.rollNumber || !data.studentName || !data.branch) {
      throw new HttpException('Missing fields', HttpStatus.BAD_REQUEST);
    }
    return this.adminService.addEligibility(data);
  }

  @Post('eligibility/import')
  async importEligibility(@Body() data: { rows: any[]; branch: string }) {
    if (!data.rows || !Array.isArray(data.rows) || !data.branch) {
      throw new HttpException('Invalid rows array or missing branch', HttpStatus.BAD_REQUEST);
    }
    return this.adminService.importEligibility(data.rows, data.branch);
  }

  @Get('import-errors')
  async getImportErrors() {
    return this.adminService.getImportErrors();
  }

  @Delete('import-errors')
  async clearImportErrors() {
    return this.adminService.clearImportErrors();
  }

  @Get('template')
  async getTemplate() {
    return this.adminService.getTemplate();
  }

  @Post('template')
  async saveTemplate(@Body() data: { bgImageUrl: string; config: any }) {
    if (!data.bgImageUrl || !data.config) {
      throw new HttpException('Missing template fields', HttpStatus.BAD_REQUEST);
    }
    return this.adminService.saveTemplate(data);
  }
}
