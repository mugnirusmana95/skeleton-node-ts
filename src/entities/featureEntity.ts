import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  AfterLoad,
  OneToMany
} from 'typeorm'

import { FeaturePermission } from '~/entities/featurePermissionEntity'

@Entity({ schema: 'access', name: 'features' })
export class Feature {
  @PrimaryGeneratedColumn("uuid")
  id!: string

  @Column({ type: 'varchar' })
  code!: string

  @Column({ type: 'varchar' })
  name!: string

  @Column({ type: 'boolean' })
  isActive!: boolean

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt!: Date

  @DeleteDateColumn({ nullable: true, type: 'timestamp', select: false })
  deletedAt?: Date

  isDeleted?: boolean

  @OneToMany(
    () => FeaturePermission,
    (model) => model.feature,
  )
  featurePermissions!: FeaturePermission[]

  @AfterLoad()
  computeIsDeleted() {
    if (typeof this.deletedAt === 'undefined') {
      delete this.isDeleted
    } else {
      this.isDeleted = this.deletedAt ? true : false
    }
  }
}