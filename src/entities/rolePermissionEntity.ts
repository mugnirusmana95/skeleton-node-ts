import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  AfterLoad,
  ManyToOne,
  JoinColumn
} from 'typeorm'
import { Role } from './roleEntity'
import { FeaturePermission } from './featurePermissionEntity'

@Entity({ schema: 'access', name: 'rolePermissions' })
export class RolePermission {
  @PrimaryGeneratedColumn("uuid")
  id!: string

  @Column({ type: 'uuid' })
  roleId!: string

  @Column({ type: 'uuid' })
  featurePermissionId!: string

  @Column({ type: 'boolean' })
  isActive!: boolean

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt!: Date

  @DeleteDateColumn({ nullable: true, type: 'timestamp', select: false })
  deletedAt?: Date

  isDeleted?: boolean

  @ManyToOne(
    () => Role,
    (model) => model.rolePermissions
  )
  @JoinColumn({ name: 'roleId' })
  role!: Role

  @ManyToOne(
    () => FeaturePermission,
    (model) => model.rolePermissions
  )
  @JoinColumn({ name: 'featurePermissionId' })
  featurePermission!: FeaturePermission

  @AfterLoad()
  computeIsDeleted() {
    if (typeof this.deletedAt === 'undefined') {
      delete this.isDeleted
    } else {
      this.isDeleted = this.deletedAt ? true : false
    }
  }
}