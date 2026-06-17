import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtConfig } from '../../config/jwt.config';
import { WechatConfig } from '../../config/wechat.config';
import { User } from '../users/entities/user.entity';
import { UsersModule } from '../users/users.module';

@Global()
@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({ useClass: JwtConfig }),
    TypeOrmModule.forFeature([User]),
    UsersModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, WechatConfig],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
