import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import {
  OccupancyReportDto,
  ArrivalDepartureReportDto,
  DashboardDto,
} from './dto/report.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/dtos/user.dto';

@ApiTags('Reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @ApiOperation({ summary: 'Get occupancy report for a date range' })
  @Roles(UserRole.MANAGER, UserRole.RECEPTION)
  @Post('occupancy')
  getOccupancyReport(@Body() reportDto: OccupancyReportDto) {
    return this.reportsService.getOccupancyReport(reportDto);
  }

  @ApiOperation({ summary: 'Get arrivals and departures for a specific date' })
  @Roles(UserRole.MANAGER, UserRole.RECEPTION)
  @Post('arrivals-departures')
  getArrivalDepartureReport(@Body() reportDto: ArrivalDepartureReportDto) {
    return this.reportsService.getArrivalDepartureReport(reportDto);
  }

  @ApiOperation({ summary: 'Get dashboard data' })
  @Roles(UserRole.MANAGER, UserRole.RECEPTION, UserRole.HOUSEKEEPING)
  @Get('dashboard')
  @ApiQuery({ name: 'propertyId', required: false, type: String })
  @ApiQuery({ name: 'date', required: false, type: String })
  getDashboard(@Query() dto: DashboardDto) {
    return this.reportsService.getDashboard(dto);
  }
}