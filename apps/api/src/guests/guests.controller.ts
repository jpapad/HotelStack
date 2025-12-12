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
import { GuestsService } from './guests.service';
import { CreateGuestDto, UpdateGuestDto } from './dto/guest.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/dtos/user.dto';
import { PaginationDto } from '../../common/dtos/pagination.dto';

@ApiTags('Guests')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('guests')
export class GuestsController {
  constructor(private readonly guestsService: GuestsService) {}

  @ApiOperation({ summary: 'Create a new guest' })
  @Roles(UserRole.MANAGER, UserRole.RECEPTION)
  @Post()
  create(@Body() createGuestDto: CreateGuestDto) {
    return this.guestsService.create(createGuestDto);
  }

  @ApiOperation({ summary: 'Get all guests with pagination and search' })
  @Roles(UserRole.MANAGER, UserRole.RECEPTION, UserRole.HOUSEKEEPING)
  @Get()
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'propertyId', required: false, type: String })
  findAll(
    @Query() paginationDto: PaginationDto,
    @Query('search') search?: string,
    @Query('propertyId') propertyId?: string,
  ) {
    return this.guestsService.findAll(
      paginationDto.page,
      paginationDto.limit,
      search,
      propertyId,
    );
  }

  @ApiOperation({ summary: 'Get guest by ID' })
  @Roles(UserRole.MANAGER, UserRole.RECEPTION, UserRole.HOUSEKEEPING)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.guestsService.findOne(id);
  }

  @ApiOperation({ summary: 'Update guest' })
  @Roles(UserRole.MANAGER, UserRole.RECEPTION)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateGuestDto: UpdateGuestDto) {
    return this.guestsService.update(id, updateGuestDto);
  }

  @ApiOperation({ summary: 'Delete guest' })
  @Roles(UserRole.MANAGER)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.guestsService.remove(id);
  }
}