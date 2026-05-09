import { IsString, IsOptional, IsBoolean, MaxLength } from 'class-validator';

export class CreatePermissionDto {
  @IsString(
    {
      message: 'Tên quyền phải là một chuỗi ký tự',
    }
  )
  @MaxLength(100, {
    message: 'Tên quyền phải có độ dài tối đa 100 ký tự',
  })
  name: string;

  @IsString(
    {
      message: 'Hành động phải là một chuỗi ký tự',
    }
  )
  @MaxLength(50, {
    message: 'Hành động phải có độ dài tối đa 50 ký tự',
  })
  action: string;

  @IsString(
    {
      message: 'Đối tượng phải là một chuỗi ký tự',
    }
  )
  @MaxLength(100, {
    message: 'Đối tượng phải có độ dài tối đa 100 ký tự',
  })
  subject: string;

  @IsString({
    message: 'Mô tả phải là một chuỗi ký tự',
  })
  @IsOptional()
  @MaxLength(255, {
    message: 'Mô tả phải có độ dài tối đa 255 ký tự',
  })
  description?: string;

  @IsBoolean()
  @IsOptional()
  inverted?: boolean;

  @IsString()
  @IsOptional()
  conditions?: string;
}
