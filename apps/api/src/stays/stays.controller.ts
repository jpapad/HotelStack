import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
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
import { StaysService } from './stays.service';
import { CreateStayDto, UpdateStayDto } from './dto/stay.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/dtos/user.dto';
import { PaginationDto } from '../common/dtos/pagination.dto';

@ApiTags('Stays')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('stays')
export class StaysController {
  constructor(private readonly staysService: StaysService) {}

  @ApiOperation({ summary: 'Create a new stay' })
  @Roles(UserRole.MANAGER, UserRole.RECEPTION)
  @Post()
  create(@Body() createStayDto: CreateStayDto) {
    return this.staysService.create(createStayDto);
  }

  @ApiOperation({ summary: 'Get all stays' })
  @Roles(UserRole.MANAGER, UserRole.RECEPTION, UserRole.HOUSEKEEPING)
  @Get()
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'propertyId', required: false, type: String })
  findAll(
    @Query() paginationDto: PaginationDto,
    @Query('propertyId') propertyId?: string,
  ) {
    return this.staysService.findAll(
      paginationDto.page,
      paginationDto.limit,
      propertyId,
    );
  }

  @ApiOperation({ summary: 'Get active stays' })
  @Roles(UserRole.MANAGER, UserRole.RECEPTION, UserRole.HOUSEKEEPING)
  @Get('active')
  @ApiQuery({ name: 'propertyId', required: false, type: String })
  getActive(@Query('propertyId') propertyId?: string) {
    return this.staysService.getActiveStays(propertyId);
  }

  @ApiOperation({ summary: 'Get stay by ID' })
  @Roles(UserRole.MANAGER, UserRole.RECEPTION, UserRole.HOUSEKEEPING)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.staysService.findOne(id);
  }

  @ApiOperation({ summary: 'Update stay' })
  @Roles(UserRole.MANAGER, UserRole.RECEPTION)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateStayDto: UpdateStayDto) {
    return this.staysService.update(id, updateStayDto);
  }

  @ApiOperation({ summary: 'Delete stay' })
  @Roles(UserRole.MANAGER)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.staysService.remove(id);
  }
}