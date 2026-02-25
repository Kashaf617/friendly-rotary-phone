import { IsOptional, IsString, IsIn, IsNumber, IsPositive, IsDateString } from 'class-validator';

const STATUS_OPTIONS = ['active', 'expired', 'cancelled', 'trial'] as const;

export class UpdateSubscriptionDto {
  @IsOptional()
  @IsString()
  plan_name?: string;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  price?: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  duration_months?: number;

  @IsOptional()
  @IsString()
  @IsIn(STATUS_OPTIONS as unknown as string[])
  status?: string;

  @IsOptional()
  @IsDateString()
  start_date?: string;

  @IsOptional()
  @IsDateString()
  end_date?: string;
}
