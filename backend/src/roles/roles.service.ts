import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from './entities/role.entity';
import { Repository, In, Like } from 'typeorm';
import { Permission } from '../permissions/entities/permission.entity';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private rolesRepository: Repository<Role>,
    @InjectRepository(Permission)
    private permissionsRepository: Repository<Permission>,
  ) {}

  async create(createRoleDto: CreateRoleDto) {
    const { permissionIds, ...roleData } = createRoleDto;
    const newRole = this.rolesRepository.create(roleData);

    if (permissionIds && permissionIds.length > 0) {
      newRole.permissions = await this.permissionsRepository.findBy({
        id: In(permissionIds),
      });
    }

    return this.rolesRepository.save(newRole);
  }

  async findAll(query?: { name?: string; page?: number; limit?: number }, currentUser?: any) {
    const page = query?.page ? +query.page : 1;
    const limit = query?.limit ? +query.limit : 10;
    const skip = (page - 1) * limit;

    const queryBuilder = this.rolesRepository.createQueryBuilder('role')
      .leftJoinAndSelect('role.permissions', 'permission');

    // 1. Tìm ID của role super_admin
    const superAdminRole = await this.rolesRepository.findOne({ where: { name: 'super_admin' } });
    
    // 2. Kiểm tra xem user hiện tại có phải là super_admin không
    const isSuperAdmin = currentUser && superAdminRole && currentUser.roles.includes(superAdminRole.id);

    // 3. Nếu không phải super_admin, lọc bỏ role super_admin khỏi danh sách
    if (!isSuperAdmin && superAdminRole) {
      queryBuilder.andWhere('role.name != :saName', { saName: 'super_admin' });
    }

    if (query?.name) {
      queryBuilder.andWhere('role.name LIKE :name', { name: `%${query.name}%` });
    }

    const [items, total] = await queryBuilder
      .take(limit)
      .skip(skip)
      .orderBy('role.id', 'DESC')
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
    const role = await this.rolesRepository.findOne({
      where: { id },
      relations: ['permissions'],
    });
    if (!role) {
      throw new NotFoundException(`Role #${id} not found`);
    }
    return role;
  }

  async update(id: number, updateRoleDto: UpdateRoleDto) {
    const { permissionIds, ...updateData } = updateRoleDto;

    const role = await this.rolesRepository.findOne({
      where: { id },
      relations: ['permissions'],
    });

    if (!role) {
      throw new NotFoundException(`Role #${id} not found`);
    }

    Object.assign(role, updateData);

    if (permissionIds !== undefined) {
      if (permissionIds.length > 0) {
        role.permissions = await this.permissionsRepository.findBy({
          id: In(permissionIds),
        });
      } else {
        role.permissions = [];
      }
    }

    return this.rolesRepository.save(role);
  }

  async remove(id: number) {
    try {
      const result = await this.rolesRepository.delete(id);
      if (result.affected === 0) {
        throw new NotFoundException(`Role #${id} không tìm thấy`);
      }
      return { message: 'Xóa vai trò thành công' };
    } catch (error) {
      // Check for foreign key constraint violation (MySQL 1451)
      if (error.errno === 1451 || error.code === 'ER_ROW_IS_REFERENCED_2') {
        throw new ConflictException(
          'Không thể xóa vai trò này vì đang có người dùng sử dụng. Vui lòng gỡ vai trò khỏi tất cả người dùng trước khi thực hiện xóa.',
        );
      }
      throw error;
    }
  }
}

