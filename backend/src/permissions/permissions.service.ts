  import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
  import { InjectRepository } from '@nestjs/typeorm';
  import { Repository, Like } from 'typeorm';
  import { Permission } from './entities/permission.entity';
  import { CreatePermissionDto } from './dto/create-permission.dto';
  import { UpdatePermissionDto } from './dto/update-permission.dto';

  @Injectable()
  export class PermissionsService {
    constructor(
      @InjectRepository(Permission)
      private permissionsRepository: Repository<Permission>,
    ) {}

    create(createPermissionDto: CreatePermissionDto) {
      const permission = this.permissionsRepository.create(createPermissionDto);
      return this.permissionsRepository.save(permission);
    }

    async findAll(query?: { name?: string; action?: string; subject?: string; search?: string; page?: number; limit?: number }) {
      const page = query?.page ? +query.page : 1;
      const limit = query?.limit ? +query.limit : 10;
      const skip = (page - 1) * limit;

      const queryBuilder = this.permissionsRepository.createQueryBuilder('permission');
      
      if (query?.search) {
        const searchPattern = `%${query.search}%`;
        queryBuilder.where(
          '(permission.name LIKE :search OR permission.action LIKE :search OR permission.subject LIKE :search)',
          { search: searchPattern }
        );
      } else {
        if (query?.name) {
          queryBuilder.andWhere('permission.name LIKE :name', { name: `%${query.name}%` });
        }
        if (query?.action) {
          queryBuilder.andWhere('permission.action LIKE :action', { action: `%${query.action}%` });
        }
        if (query?.subject) {
          queryBuilder.andWhere('permission.subject LIKE :subject', { subject: `%${query.subject}%` });
        }
      }

      // Sắp xếp ưu tiên:
      // 1. subject = 'all' và action = 'manage'
      // 2. subject = 'all' và action = 'read'
      // 3. các subject = 'all' khác
      // 4. Sắp xếp theo subject (A-Z)
      const [items, total] = await queryBuilder
        .orderBy(`CASE 
          WHEN permission.subject = 'all' AND permission.action = 'manage' THEN 1
          WHEN permission.subject = 'all' AND (permission.action = 'read' OR permission.action LIKE '%read%') THEN 2
          WHEN permission.subject = 'all' THEN 3
          ELSE 4 
        END`, 'ASC')
        .addOrderBy('permission.subject', 'ASC')
        .addOrderBy('permission.action', 'ASC')
        .skip(skip)
        .take(limit)
        .getManyAndCount();

      return {
        items,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    }

    async findOne(id: number) {
      const permission = await this.permissionsRepository.findOneBy({ id });
      if (!permission) {
        throw new NotFoundException(`Permission #${id} not found`);
      }
      return permission;
    }

    async update(id: number, updatePermissionDto: UpdatePermissionDto) {
      const permission = await this.findOne(id);
      Object.assign(permission, updatePermissionDto);
      return this.permissionsRepository.save(permission);
    }

    async remove(id: number) {
      const permission = await this.findOne(id);
      try {
        return await this.permissionsRepository.remove(permission);
      } catch (error) {
        if (error.errno === 1451 || error.code === 'ER_ROW_IS_REFERENCED_2') {
          throw new ConflictException(
            'Không thể xóa quyền này vì đang được gắn với một hoặc nhiều vai trò. Vui lòng gỡ quyền này khỏi các vai trò trước khi thực hiện xóa.',
          );
        }
        throw error;
      }
    }


    /**
     * Get all unique actions that exist in the code
     */
    async getAvailableActions(): Promise<string[]> {
      const standardActions = [
        'view',
        'manage',
        'create',
        'read',
        'update',
        'delete'
      ];

      return standardActions;
    }

    /**
     * Get all unique subjects that exist in the code
     */
    async getAvailableSubjects(): Promise<string[]> {
      const standardSubjects = [
        'all',
        'User',
        'Role',
        'Permission',
      ];

      return standardSubjects;
    }
  }
