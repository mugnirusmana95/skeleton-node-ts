import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
  AfterLoad
} from 'typeorm'

import { User } from '~/entities/userEntity'
import { RolePermission } from './rolePermissionEntity'
import { SelectQueryBuilder } from 'typeorm/browser'
import { EStatusDelete, TParsedParams } from '~/helpers/paramHelper'

@Entity({ schema: 'public', name: 'roles' })
export class Role {
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
    () => User,
    (model) => model.role
  )
  users!: User[]

  @OneToMany(
    () => RolePermission,
    (model) => model.role
  )
  rolePermissions!: RolePermission[]

  @AfterLoad()
  computeIsDeleted() {
    if (typeof this.deletedAt === 'undefined' || !this.deletedAt) {
      delete this.isDeleted
    } else {
      this.isDeleted = this.deletedAt ? true : false
    }
  }

  static filterList(
    query: SelectQueryBuilder<Role>,
    params: TParsedParams
  ): SelectQueryBuilder<Role> {
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