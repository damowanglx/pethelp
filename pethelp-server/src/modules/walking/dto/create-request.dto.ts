import { IsString, IsNotEmpty, IsOptional, IsNumber, IsDateString, IsBoolean, Min, Max, IsIn, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateWalkingRequestDto {
  @IsInt()
  @Min(1)
  petId: number;

  @IsDateString()
  walkDate: string;

  @IsString()
  @IsNotEmpty()
  startTime: string;

  @IsString()
  @IsNotEmpty()
  endTime: string;

  @IsInt()
  @Min(15)
  @Max(180)
  durationMinutes: number;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsNumber()
  latitude: number;

  @IsNumber()
  longitude: number;

  @IsOptional()
  @IsIn(['free', 'points', 'cash'])
  rewardType?: string = 'free';

  @IsOptional()
  @IsNumber()
  @Min(0)
  rewardAmount?: number = 0;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  requireExperience?: boolean = false;
}
