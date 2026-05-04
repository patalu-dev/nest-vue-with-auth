import { IsString, IsEmail, IsBoolean, MaxLength, IsOptional, IsNumber, IsArray } from 'class-validator';

export class CreateUserDto {
    @IsString()
    @MaxLength(100)
    name: string;

    @IsString()
    @MaxLength(50)
    username: string;

    @IsEmail()
    @IsOptional()
    email?: string;

    @IsString()
    @IsOptional()
    password?: string;

    @IsBoolean()
    isActive: boolean;

    @IsArray()
    @IsNumber({}, { each: true })
    @IsOptional()
    roleIds?: number[];
}
