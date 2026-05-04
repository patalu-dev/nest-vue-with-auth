import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PoliciesGuard } from '../ability/policies.guard';
import { CheckPolicies } from '../ability/check-policies.decorator';

@UseGuards(JwtAuthGuard)
@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Post()
  @UseGuards(PoliciesGuard)
  @CheckPolicies({ action: 'create', subject: 'Permission' })
  create(@Body() createPermissionDto: CreatePermissionDto) {
    return this.permissionsService.create(createPermissionDto);
  }

  @Get()
  @UseGuards(PoliciesGuard)
  @CheckPolicies({ action: 'read', subject: 'Permission' })
  findAll(@Query() query: { action?: string; subject?: string; page?: number; limit?: number }) {
    return this.permissionsService.findAll(query);
  }

  @Get('actions')
  @UseGuards(PoliciesGuard)
  @CheckPolicies({ action: 'read', subject: 'Permission' })
  getActions() {
    return this.permissionsService.getAvailableActions();
  }

  @Get('subjects')
  @UseGuards(PoliciesGuard)
  @CheckPolicies({ action: 'read', subject: 'Permission' })
  getSubjects() {
    return this.permissionsService.getAvailableSubjects();
  }

  @Get(':id')
  @UseGuards(PoliciesGuard)
  @CheckPolicies({ action: 'read', subject: 'Permission' })
  findOne(@Param('id') id: string) {
    return this.permissionsService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(PoliciesGuard)
  @CheckPolicies({ action: 'update', subject: 'Permission' })
  update(@Param('id') id: string, @Body() updatePermissionDto: UpdatePermissionDto) {
    return this.permissionsService.update(+id, updatePermissionDto);
  }

  @Delete(':id')
  @UseGuards(PoliciesGuard)
  @CheckPolicies({ action: 'delete', subject: 'Permission' })
  remove(@Param('id') id: string) {
    return this.permissionsService.remove(+id);
  }
}
