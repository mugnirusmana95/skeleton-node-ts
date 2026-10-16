import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  AfterLoad,
  ManyToOne,
  JoinColumn,
  OneToMany
} from 'typeorm'

import { Feature } from '~/entities/featureEntity'
import { FeatureAction } from '~/entities/featureActionEntity'
import { RolePermission } from './rolePermissionEntity'

@Entity({ schema: 'access', name: 'featurePermissions' })
export class FeaturePermission {
  @PrimaryGeneratedColumn("uuid")
  id!: string

  @Column({ type: 'uuid' })
  featureId!: string

  @Column({ type: 'uuid' })
  featureActionId!: string

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
    () => Feature,
    (model) => model.featurePermissions
  )
  @JoinColumn({ name: 'featureId' })
  feature!: Feature

  @ManyToOne(
    () => FeatureAction,
    (model) => model.featurePermissions
  )
  @JoinColumn({ name: 'featureActionId' })
  featureAction!: FeatureAction

  @OneToMany(
    () => RolePermission,
    (model) => model.featurePermission,
  )
  rolePermissions!: RolePermission[]

  @AfterLoad()
  computeIsDeleted() {
    if (typeof this.deletedAt === 'undefined') {
      delete this.isDeleted
    } else {
      this.isDeleted = this.deletedAt ? true : false
    }
  }
}