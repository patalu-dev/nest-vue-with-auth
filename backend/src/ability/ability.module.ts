import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AbilityFactory } from './ability.factory';
import { PoliciesGuard } from './policies.guard';
import { Role } from '../roles/entities/role.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Role])],
  providers: [AbilityFactory, PoliciesGuard],
  exports: [AbilityFactory, PoliciesGuard],
})
export class AbilityModule {}
