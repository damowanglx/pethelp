import { Controller, Get, Patch, Body, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../../common/interfaces/jwt-payload.interface';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(@CurrentUser() user: JwtPayload) {
    return this.usersService.findById(user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  async updateProfile(@CurrentUser() user: JwtPayload, @Body() body: Record<string, unknown>) {
    return this.usersService.updateProfile(user.sub, body as Partial<import('./entities/user.entity').User>);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me/location')
  async updateLocation(
    @CurrentUser() user: JwtPayload,
    @Body() body: { latitude: number; longitude: number },
  ) {
    await this.usersService.updateLocation(user.sub, body.latitude, body.longitude);
    return { success: true };
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getPublicProfile(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findById(id);
  }
}
