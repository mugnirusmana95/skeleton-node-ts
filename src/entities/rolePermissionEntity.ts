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
  SelectQueryBuilder
} from 'typeorm'
import { Role } from './roleEntity'
import { FeaturePermission } from './featurePermissionEntity'
import { EStatusDelete, TParsedParams } from '~/helpers/paramHelper'

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
    if (typeof this.deletedAt === 'undefined' || !this.deletedAt) {
      delete this.isDeleted
    } else {
      this.isDeleted = this.deletedAt ? true : false
    }
  }

  static filterList(
    query: SelectQueryBuilder<RolePermission>,
    params: TParsedParams
  ): SelectQueryBuilder<RolePermission> {
    const { statusDelete, search, orderBy } = params

    if (statusDelete === EStatusDelete.WITH || statusDelete === EStatusDelete.ONLY) {
      query
        .withDeleted()
        .addSelect('role.deletedAt')
    }

    if (statusDelete === EStatusDelete.ONLY) {
      query.andWhere('role.deletedAt IS NOT NULL')
    }

    if (search) {
      query.andWhere(`(role.code ILIKE :search OR role.name ILIKE :search)`, { search: `%${search}%` })
    }

    if (orderBy && orderBy.length > 0) {
      for (const item of orderBy) {
        const columnMap: Record<string, string> = {
          code: 'role.code',
          name: 'role.name',
          createdAt: 'role.createdAt',
          updatedAt: 'role.updatedAt',
        }

        const column = columnMap[item.column]

        if (column) {
          query.addOrderBy(
            column,
            item.direction.toUpperCase() as 'ASC' | 'DESC',
          )
        }
      }
    } else {
      query.addOrderBy('role.updatedAt', 'DESC')
    }

    return query
  }
}