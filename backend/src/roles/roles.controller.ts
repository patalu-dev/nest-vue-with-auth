import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Req } from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PoliciesGuard } from '../ability/policies.guard';
import { CheckPolicies } from '../ability/check-policies.decorator';

@UseGuards(JwtAuthGuard)
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  @UseGuards(PoliciesGuard)
  @CheckPolicies({ action: 'create', subject: 'Role' })
  create(@Body() createRoleDto: CreateRoleDto) {
    return this.rolesService.create(createRoleDto);
  }

  @Get()
  @UseGuards(PoliciesGuard)
  @CheckPolicies({ action: 'read', subject: 'Role' })
  findAll(@Query() query: { name?: string; page?: number; limit?: number }, @Req() req: any) {
    return this.rolesService.findAll(query, req.user);
  }

  @Get(':id')
  @UseGuards(PoliciesGuard)
  @CheckPolicies({ action: 'read', subject: 'Role' })
  findOne(@Param('id') id: string) {
    return this.rolesService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(PoliciesGuard)
  @CheckPolicies({ action: 'update', subject: 'Role' })
  update(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto) {
    return this.rolesService.update(+id, updateRoleDto);
  }

  @Delete(':id')
  @UseGuards(PoliciesGuard)
  @CheckPolicies({ action: 'delete', subject: 'Role' })
  remove(@Param('id') id: string) {
    return this.rolesService.remove(+id);
  }
}
