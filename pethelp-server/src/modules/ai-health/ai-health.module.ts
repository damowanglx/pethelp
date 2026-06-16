import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiConsultation } from './entities/ai-consultation.entity';
import { AiDailyUsage } from './entities/ai-daily-usage.entity';
import { AiHealthController } from './ai-health.controller';
import { AiHealthService } from './ai-health.service';

@Module({
  imports: [TypeOrmModule.forFeature([AiConsultation, AiDailyUsage])],
  controllers: [AiHealthController],
  providers: [AiHealthService],
  exports: [AiHealthService],
})
export class AiHealthModule {}
