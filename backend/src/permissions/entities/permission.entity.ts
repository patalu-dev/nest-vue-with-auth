import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('permissions')
export class Permission {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  /** CASL action: 'manage' | 'create' | 'read' | 'update' | 'delete' */
  @Column({ length: 50 })
  action: string;

  /** CASL subject: entity name like 'User', 'Role', or 'all' */
  @Column({ length: 100 })
  subject: string;

  /** Human-readable description */
  @Column({ length: 255, nullable: true })
  description: string;

  /** If true, this permission DENIES the action (cannot) */
  @Column({ default: false })
  inverted: boolean;

  /** JSON conditions for field-level or conditional permissions */
  @Column({ type: 'text', nullable: true })
  conditions: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
