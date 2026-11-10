import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  AfterLoad,
  OneToMany,
  SelectQueryBuilder
} from 'typeorm'

import { FeaturePermission } from '~/entities/featurePermissionEntity'
import { EStatusDelete, TParsedParams } from '~/helpers/paramHelper'

@Entity({ schema: 'master', name: 'featureActions' })
export class FeatureAction {
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
    (model) => model.featureAction,
  )
  featurePermissions!: FeaturePermission[]

  @AfterLoad()
  computeIsDeleted() {
    if (typeof this.deletedAt === 'undefined' || !this.deletedAt) {
      delete this.isDeleted
    } else {
      this.isDeleted = this.deletedAt ? true : false
    }
  }

  static filterList(
    query: SelectQueryBuilder<FeatureAction>,
    params: TParsedParams
  ): SelectQueryBuilder<FeatureAction> {
    const { statusDelete, search, orderBy } = params

    query.leftJoinAndSelect('featureAction.featurePermissions', 'featurePermissions')

    if (statusDelete === EStatusDelete.WITH || statusDelete === EStatusDelete.ONLY) {
      query
        .withDeleted()
        .addSelect('featureAction.deletedAt')
        .addSelect('featurePermissions.deletedAt')
    }

    if (statusDelete === EStatusDelete.ONLY) {
      query.andWhere('featureAction.deletedAt IS NOT NULL')
    }

    if (search) {
      query.andWhere(`(featureAction.code ILIKE :search OR featureAction.name ILIKE :search)`, { search: `%${search}%` })
    }

    if (orderBy && orderBy.length > 0) {
      for (const item of orderBy) {
        const columnMap: Record<string, string> = {
          code: 'featureAction.code',
          name: 'featureAction.name',
          createdAt: 'featureAction.createdAt',
          updatedAt: 'featureAction.updatedAt',
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
      query.addOrderBy('featureAction.updatedAt', 'DESC')
    }

    return query
  }
}