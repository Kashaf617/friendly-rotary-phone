import { IsUUID, IsString, IsNumber, IsPositive, IsIn, IsDateString } from 'class-validator';

const STATUS_OPTIONS = ['active', 'expired', 'cancelled', 'trial'] as const;

export class CreateSubscriptionDto {
  @IsUUID()
  tenant_id: string;

  @IsString()
  plan_name: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  price: number;

  @IsNumber()
  @IsPositive()
  duration_months: number;

  @IsString()
  @IsIn(STATUS_OPTIONS as unknown as string[])
  status: string;

  @IsDateString()
  start_date: string;

  @IsDateString()
  end_date: string;
}
