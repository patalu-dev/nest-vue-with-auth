import { IsString, IsEmail, IsBoolean, MaxLength, IsOptional, IsNumber, IsArray } from 'class-validator';

export class CreateUserDto {
    @IsString({
        message: 'Họ tên phải là một chuỗi ký tự'
    })
    @MaxLength(100, {
        message: 'Họ tên phải có độ dài tối đa 100 ký tự'
    })
    name: string;

    @IsString({
        message: 'Tên đăng nhập phải là một chuỗi ký tự'
    })
    @MaxLength(50, {
        message: 'Tên đăng nhập phải có độ dài tối đa 50 ký tự'
    })
    username: string;

    @IsEmail({}, {
        message: 'Email không hợp lệ'
    })
    @IsOptional()
    email?: string;

    @IsString({
        message: 'Mật khẩu phải là một chuỗi ký tự'
    })
    @IsOptional()
    password?: string;

    @IsBoolean()
    isActive: boolean;

    @IsArray()
    @IsNumber({}, { each: true })
    @IsOptional()
    roleIds?: number[];
}
