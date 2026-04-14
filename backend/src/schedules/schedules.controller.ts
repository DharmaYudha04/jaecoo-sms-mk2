import { BadRequestException, Body, Controller, Get, Post, Query } from '@nestjs/common';
import { SchedulesService } from './schedules.service';

@Controller('schedules')
export class SchedulesController {
  constructor(private readonly schedulesService: SchedulesService) {}

  @Get('mechanics')
  getMechanics(@Query('role') role?: string) {
    return this.schedulesService.getMechanics(role);
  }

  @Get('by-date')
  getByDate(@Query('date') date?: string) {
    if (!date) throw new BadRequestException('Parameter date diperlukan (YYYY-MM-DD).');
    return this.schedulesService.getByDate(date);
  }

  @Get('upcoming')
  getUpcoming(@Query('daysAhead') daysAhead?: string) {
    return this.schedulesService.getUpcoming(daysAhead ? Number(daysAhead) : 7);
  }

  @Post()
  create(@Body() body: Record<string, unknown>) {
    return {
      success: true,
      message: 'Schedule sementara diterima untuk kompatibilitas frontend.',
      data: body,
    };
  }
}

