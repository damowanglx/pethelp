import { Controller, Get, Post, Patch, Delete, Body, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { PetsService } from './pets.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../../common/interfaces/jwt-payload.interface';

@UseGuards(JwtAuthGuard)
@Controller('pets')
export class PetsController {
  constructor(private petsService: PetsService) {}

  @Get()
  async list(@CurrentUser() user: JwtPayload) {
    return this.petsService.findByUser(user.sub);
  }

  @Post()
  async create(@CurrentUser() user: JwtPayload, @Body() body: Record<string, unknown>) {
    return this.petsService.create(user.sub, body);
  }

  @Get(':id')
  async get(@Param('id', ParseIntPipe) id: number) {
    return this.petsService.findById(id);
  }

  @Patch(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() body: Record<string, unknown>) {
    return this.petsService.update(id, body);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.petsService.remove(id);
    return { success: true };
  }
}
