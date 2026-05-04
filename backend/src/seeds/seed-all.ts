import 'dotenv/config';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Permission } from '../permissions/entities/permission.entity';
import { Role } from '../roles/entities/role.entity';
import { User } from '../users/entities/user.entity';

/**
 * Seed tất cả dữ liệu mẫu: Permissions → Roles → Admin User
 * 
 * Usage: npx ts-node -r tsconfig-paths/register src/seeds/seed-all.ts
 */

const dataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'nest_vue_with_auth',
  entities: [Permission, Role, User],
  synchronize: true,
});

async function seed() {
  await dataSource.initialize();
  console.log('📦 Kết nối database thành công!\n');

  const permissionRepo = dataSource.getRepository(Permission);
  const roleRepo = dataSource.getRepository(Role);
  const userRepo = dataSource.getRepository(User);

  // =============================================
  // 1. TẠO PERMISSIONS
  // =============================================
  console.log('━━━ BƯỚC 1: Tạo Permissions ━━━');

  const defaultPermissions = [
    // Super admin
    { name: 'Toàn quyền', action: 'manage', subject: 'all', description: 'Toàn quyền quản lý hệ thống', inverted: false },

    // User module
    { name: 'Tạo người dùng', action: 'create', subject: 'User', description: 'Tạo người dùng mới', inverted: false },
    { name: 'Xem người dùng', action: 'read', subject: 'User', description: 'Xem thông tin người dùng', inverted: false },
    { name: 'Sửa người dùng', action: 'update', subject: 'User', description: 'Cập nhật thông tin người dùng', inverted: false },
    { name: 'Xóa người dùng', action: 'delete', subject: 'User', description: 'Xóa người dùng', inverted: false },

    // Role module
    { name: 'Tạo vai trò', action: 'create', subject: 'Role', description: 'Tạo vai trò mới', inverted: false },
    { name: 'Xem vai trò', action: 'read', subject: 'Role', description: 'Xem thông tin vai trò', inverted: false },
    { name: 'Sửa vai trò', action: 'update', subject: 'Role', description: 'Cập nhật vai trò', inverted: false },
    { name: 'Xóa vai trò', action: 'delete', subject: 'Role', description: 'Xóa vai trò', inverted: false },

    // Permission module
    { name: 'Tạo quyền', action: 'create', subject: 'Permission', description: 'Tạo quyền mới', inverted: false },
    { name: 'Xem quyền', action: 'read', subject: 'Permission', description: 'Xem thông tin quyền', inverted: false },
    { name: 'Sửa quyền', action: 'update', subject: 'Permission', description: 'Cập nhật quyền', inverted: false },
    { name: 'Xóa quyền', action: 'delete', subject: 'Permission', description: 'Xóa quyền', inverted: false },

    // General
    { name: 'Xem tất cả', action: 'read', subject: 'all', description: 'Xem tất cả thông tin', inverted: false },
  ];

  const savedPermissions: Permission[] = [];
  for (const perm of defaultPermissions) {
    let existing = await permissionRepo.findOneBy({
      action: perm.action,
      subject: perm.subject,
      inverted: perm.inverted,
    });

    if (!existing) {
      existing = await permissionRepo.save(permissionRepo.create(perm));
      console.log(`  ✅ Tạo permission: ${perm.action} → ${perm.subject}`);
    } else {
      console.log(`  ⏭️  Đã tồn tại: ${perm.action} → ${perm.subject}`);
    }
    savedPermissions.push(existing);
  }

  // =============================================
  // 2. TẠO ROLES + GÁN PERMISSIONS
  // =============================================
  console.log('\n━━━ BƯỚC 2: Tạo Roles ━━━');

  // --- Admin Role: manage all ---
  let adminRole = await roleRepo.findOne({
    where: { name: 'admin' },
    relations: ['permissions'],
  });

  if (!adminRole) {
    adminRole = roleRepo.create({ name: 'admin', description: 'Quản trị viên - toàn quyền' });
  }
  const manageAll = savedPermissions.find((p) => p.action === 'manage' && p.subject === 'all');
  adminRole.permissions = manageAll ? [manageAll] : [];
  await roleRepo.save(adminRole);
  console.log('  ✅ Role "admin" → manage:all');

  // --- User Role: read all ---
  let userRole = await roleRepo.findOne({
    where: { name: 'user' },
    relations: ['permissions'],
  });

  if (!userRole) {
    userRole = roleRepo.create({ name: 'user', description: 'Người dùng thông thường' });
  }
  const readAll = savedPermissions.find((p) => p.action === 'read' && p.subject === 'all');
  userRole.permissions = readAll ? [readAll] : [];
  await roleRepo.save(userRole);
  console.log('  ✅ Role "user" → read:all');

  // =============================================
  // 3. TẠO USER ADMIN
  // =============================================
  console.log('\n━━━ BƯỚC 3: Tạo User Admin ━━━');

  const adminUsername = 'admin';
  const existingAdmin = await userRepo.findOne({
    where: { username: adminUsername },
    relations: ['roles'],
  });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash('123456', 10);
    const adminUser = userRepo.create({
      name: 'Administrator',
      username: adminUsername,
      email: 'admin@example.com',
      password: hashedPassword,
      isActive: true,
      roles: [adminRole],
    });
    await userRepo.save(adminUser);
    console.log('  ✅ Tạo user admin (username: admin, password: 123456)');
  } else {
    // Đảm bảo admin user có admin role
    const hasAdminRole = existingAdmin.roles?.some((r) => r.name === 'admin');
    if (!hasAdminRole) {
      existingAdmin.roles = [...(existingAdmin.roles || []), adminRole];
      await userRepo.save(existingAdmin);
      console.log('  ✅ Đã gán role admin cho user admin');
    } else {
      console.log('  ⏭️  User admin đã tồn tại và đã có role admin');
    }
  }

  // =============================================
  // SUMMARY
  // =============================================
  const permCount = await permissionRepo.count();
  const roleCount = await roleRepo.count();
  const userCount = await userRepo.count();

  console.log('\n╔══════════════════════════════════════╗');
  console.log('║       🎉 SEED HOÀN TẤT!             ║');
  console.log('╠══════════════════════════════════════╣');
  console.log(`║  Permissions : ${String(permCount).padStart(3)}                   ║`);
  console.log(`║  Roles       : ${String(roleCount).padStart(3)}                   ║`);
  console.log(`║  Users       : ${String(userCount).padStart(3)}                   ║`);
  console.log('╠══════════════════════════════════════╣');
  console.log('║  Login: admin / 123456               ║');
  console.log('╚══════════════════════════════════════╝');

  await dataSource.destroy();
}

seed().catch((error) => {
  console.error('❌ Seed thất bại:', error);
  process.exit(1);
});
