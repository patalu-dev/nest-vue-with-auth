import 'dotenv/config';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Permission } from '../permissions/entities/permission.entity';
import { Role } from '../roles/entities/role.entity';
import { User } from '../users/entities/user.entity';

/**
 * Seed dữ liệu khớp với trạng thái hiện tại của Database
 * Usage: pnpm run seed:all
 */

const dataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'nest_vue_with_auth',
  entities: [Permission, Role, User],
  synchronize: false,
});

async function seed() {
  await dataSource.initialize();
  console.log('📦 Kết nối database thành công!\n');

  const permissionRepo = dataSource.getRepository(Permission);
  const roleRepo = dataSource.getRepository(Role);
  const userRepo = dataSource.getRepository(User);

  // =============================================
  // 1. TẠO PERMISSIONS (19 items)
  // =============================================
  console.log('━━━ BƯỚC 1: Cập nhật Permissions ━━━');

  const defaultPermissions = [
    { name: 'Toàn quyền', action: 'manage', subject: 'all', description: 'Toàn quyền quản lý hệ thống', inverted: false },
    { name: 'Tạo người dùng', action: 'create', subject: 'User', description: 'Tạo người dùng mới', inverted: false },
    { name: 'Xem người dùng', action: 'read', subject: 'User', description: 'Xem thông tin người dùng', inverted: false },
    { name: 'Sửa người dùng', action: 'update', subject: 'User', description: 'Cập nhật thông tin người dùng', inverted: false },
    { name: 'Xóa người dùng', action: 'delete', subject: 'User', description: 'Xóa người dùng', inverted: false },
    { name: 'Tạo vai trò', action: 'create', subject: 'Role', description: 'Tạo vai trò mới', inverted: false },
    { name: 'Xem vai trò', action: 'read', subject: 'Role', description: 'Xem thông tin vai trò', inverted: false },
    { name: 'Sửa vai trò', action: 'update', subject: 'Role', description: 'Cập nhật vai trò', inverted: false },
    { name: 'Xóa vai trò', action: 'delete', subject: 'Role', description: 'Xóa vai trò', inverted: false },
    { name: 'Tạo quyền', action: 'create', subject: 'Permission', description: 'Tạo quyền mới', inverted: false },
    { name: 'Xem quyền', action: 'read', subject: 'Permission', description: 'Xem thông tin quyền', inverted: false },
    { name: 'Sửa quyền', action: 'update', subject: 'Permission', description: 'Cập nhật quyền', inverted: false },
    { name: 'Xóa quyền', action: 'delete', subject: 'Permission', description: 'Xóa quyền', inverted: false },
    { name: 'Xem tất cả', action: 'read', subject: 'all', description: 'Xem tất cả thông tin', inverted: false },
    { name: 'Ngăn truy cập Roles', action: 'create,update,delete,view', subject: 'Role', description: 'Ngăn truy cập Roles', inverted: true },
    { name: 'Ngăn truy cập Permissions', action: 'create,update,view,delete', subject: 'Permission', description: 'Ngăn truy cập Permissions', inverted: true },
    { name: 'Xem menu User', action: 'view', subject: 'User', description: 'Xem menu User', inverted: false },
    { name: 'Xem menu Role', action: 'view', subject: 'Role', description: 'Xem menu Role', inverted: false },
    { name: 'Xem menu Permission', action: 'view', subject: 'Permission', description: 'Xem menu Permission', inverted: false },
  ];

  const savedPermissions: Permission[] = [];
  for (const perm of defaultPermissions) {
    let existing = await permissionRepo.findOneBy({ action: perm.action, subject: perm.subject, inverted: perm.inverted });
    if (!existing) {
      existing = await permissionRepo.save(permissionRepo.create(perm));
      console.log(`  ✅ Tạo: ${perm.action}:${perm.subject}`);
    }
    savedPermissions.push(existing);
  }

  // =============================================
  // 2. TẠO ROLES & GÁN QUYỀN
  // =============================================
  console.log('\n━━━ BƯỚC 2: Cập nhật Roles ━━━');

  const rolesData = [
    {
      name: 'super_admin',
      description: 'Quản trị viên - toàn quyền',
      perms: [{ a: 'manage', s: 'all', i: false }]
    },
    {
      name: 'admin',
      description: 'Quản trị viên',
      perms: [
        { a: 'manage', s: 'all', i: false },
        { a: 'create,update,delete,view', s: 'Role', i: true },
        { a: 'create,update,view,delete', s: 'Permission', i: true }
      ]
    },
    {
      name: 'user',
      description: 'Người dùng thông thường',
      perms: []
    }
  ];

  const savedRoles: Record<string, Role> = {};
  for (const rData of rolesData) {
    let role = await roleRepo.findOne({ where: { name: rData.name }, relations: ['permissions'] });
    if (!role) {
      role = roleRepo.create({ name: rData.name, description: rData.description });
    }
    
    // Tìm các permission object tương ứng
    const rolePerms: Permission[] = [];
    for (const p of rData.perms) {
      const found = savedPermissions.find(sp => sp.action === p.a && sp.subject === p.s && sp.inverted === p.i);
      if (found) rolePerms.push(found);
    }
    
    role.permissions = rolePerms;
    savedRoles[rData.name] = await roleRepo.save(role);
    console.log(`  ✅ Role "${rData.name}" updated.`);
  }

  // =============================================
  // 3. TẠO USERS
  // =============================================
  console.log('\n━━━ BƯỚC 3: Cập nhật Users ━━━');

  const usersData = [
    { name: 'Administrator', username: 'admin', roles: ['admin'] },
    { name: 'Super Administrator', username: 'super_admin', roles: ['super_admin'] },
    { name: 'User', username: 'user', roles: ['user'] },
  ];

  for (const uData of usersData) {
    let user = await userRepo.findOne({ where: { username: uData.username }, relations: ['roles'] });
    if (!user) {
      const hashedPassword = await bcrypt.hash('123456', 10);
      user = userRepo.create({
        name: uData.name,
        username: uData.username,
        password: hashedPassword,
        isActive: true,
      });
    }
    
    user.roles = uData.roles.map(rName => savedRoles[rName]);
    await userRepo.save(user);
    console.log(`  ✅ User "${uData.username}" updated.`);
  }

  console.log('\n🎉 Đã đồng bộ Seed data thành công!');
  await dataSource.destroy();
}

seed().catch(console.error);
