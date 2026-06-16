import { IsString, IsOptional, IsNotEmpty } from 'class-validator';

export class ApplyMatchDto {
  @IsOptional()
  @IsString()
  helperMessage?: string;
}

export class AcceptMatchDto {
  @IsOptional()
  @IsString()
  ownerMessage?: string;
}

export class CancelMatchDto {
  @IsString()
  @IsNotEmpty()
  cancelReason: string;
}
