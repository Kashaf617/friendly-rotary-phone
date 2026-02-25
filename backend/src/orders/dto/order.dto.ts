import {
  IsString,
  IsOptional,
  IsNumber,
  IsArray,
  IsInt,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateOrderItemDto {
  @IsUUID()
  menu_item_id: string;

  @IsString()
  item_name: string;

  @IsInt()
  @Min(1)
  quantity: number;

  @IsNumber()
  @Min(0)
  unit_price: number;

  @IsOptional()
  @IsArray()
  selected_modifiers?: { name: string; option: string; price: number }[];

  @IsOptional()
  @IsString()
  special_instructions?: string;
}

export class CreateOrderDto {
  @IsOptional()
  @IsString()
  order_type?: string;

  @IsOptional()
  @IsString()
  table_number?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  guest_count?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];

  @IsOptional()
  @IsNumber()
  discount_percent?: number;

  @IsOptional()
  @IsNumber()
  discount_amount?: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsUUID()
  customer_id?: string;
}

export class UpdateOrderStatusDto {
  @IsString()
  status: string;
}

export class ProcessPaymentDto {
  @IsString()
  payment_method: string;

  @IsOptional()
  @IsArray()
  split_details?: { method: string; amount: number }[];
}

export class UpdateKitchenStatusDto {
  @IsUUID()
  order_item_id: string;

  @IsString()
  kitchen_status: string;
}
