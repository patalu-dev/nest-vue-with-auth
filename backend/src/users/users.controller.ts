import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PoliciesGuard } from '../ability/policies.guard';
import { CheckPolicies } from '../ability/check-policies.decorator';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @UseGuards(PoliciesGuard)
  @CheckPolicies({ action: 'create', subject: 'User' })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @UseGuards(PoliciesGuard)
  @CheckPolicies({ action: 'read', subject: 'User' })
  findAll(@Query() query: { name?: string; username?: string; email?: string; role?: string; status?: string; page?: number; limit?: number; showDeleted?: string }, @Req() req: any) {
    return this.usersService.findAll(query, req.user);
  }

  @Get(':id')
  @UseGuards(PoliciesGuard)
  @CheckPolicies({ action: 'read', subject: 'User' })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(PoliciesGuard)
  @CheckPolicies({ action: 'update', subject: 'User' })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  @UseGuards(PoliciesGuard)
  @CheckPolicies({ action: 'delete', subject: 'User' })
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }

  @Post(':id/restore')
  @UseGuards(PoliciesGuard)
  @CheckPolicies({ action: 'update', subject: 'User' })
  restore(@Param('id') id: string) {
    return this.usersService.restore(+id);
  }

  @Delete(':id/permanent')
  @UseGuards(PoliciesGuard)
  @CheckPolicies({ action: 'delete', subject: 'User' })
  hardRemove(@Param('id') id: string) {
    return this.usersService.hardRemove(+id);
  }
}
