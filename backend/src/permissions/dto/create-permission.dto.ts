import { IsString, IsOptional, IsBoolean, MaxLength } from 'class-validator';

export class CreatePermissionDto {
  @IsString()
  @MaxLength(100)
  name: string;

  @IsString()
  @MaxLength(50)
  action: string;

  @IsString()
  @MaxLength(100)
  subject: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  description?: string;

  @IsBoolean()
  @IsOptional()
  inverted?: boolean;

  @IsString()
  @IsOptional()
  conditions?: string;
}
