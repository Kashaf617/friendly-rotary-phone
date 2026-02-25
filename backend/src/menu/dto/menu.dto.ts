import { IsString, IsOptional, IsBoolean, IsNumber, IsArray, IsInt, Min } from 'class-validator';

export class CreateMenuCategoryDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  name_ar?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  image_url?: string;

  @IsOptional()
  @IsInt()
  sort_order?: number;
}

export class UpdateMenuCategoryDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  name_ar?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  image_url?: string;

  @IsOptional()
  @IsInt()
  sort_order?: number;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

export class CreateMenuItemDto {
  @IsString()
  category_id: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  name_ar?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsOptional()
  @IsNumber()
  cost_price?: number;

  @IsOptional()
  @IsString()
  image_url?: string;

  @IsOptional()
  @IsArray()
  modifiers?: { name: string; options: { label: string; price: number }[] }[];

  @IsOptional()
  @IsArray()
  allergens?: string[];

  @IsOptional()
  @IsInt()
  preparation_time_minutes?: number;
}

export class UpdateMenuItemDto {
  @IsOptional()
  @IsString()
  category_id?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  name_ar?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @IsOptional()
  @IsNumber()
  cost_price?: number;

  @IsOptional()
  @IsString()
  image_url?: string;

  @IsOptional()
  @IsArray()
  modifiers?: { name: string; options: { label: string; price: number }[] }[];

  @IsOptional()
  @IsArray()
  allergens?: string[];

  @IsOptional()
  @IsBoolean()
  is_available?: boolean;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @IsOptional()
  @IsInt()
  preparation_time_minutes?: number;

  @IsOptional()
  @IsInt()
  sort_order?: number;
}
