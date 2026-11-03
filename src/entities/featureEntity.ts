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
    if (typeof this.deletedAt === 'undefined' || !this.deletedAt) {
      delete this.isDeleted
    } else {
      this.isDeleted = this.deletedAt ? true : false
    }
  }

  static filterList(
    query: SelectQueryBuilder<Feature>,
    params: TParsedParams
  ): SelectQueryBuilder<Feature> {
    const { statusDelete, search, orderBy } = params

    query
      .leftJoinAndSelect('feature.featurePermissions', 'featurePermissions')

    if (statusDelete === EStatusDelete.WITH || statusDelete === EStatusDelete.ONLY) {
      query
        .withDeleted()
        .addSelect('feature.deletedAt')
        .addSelect('featurePermissions.deletedAt')
    }

    if (statusDelete === EStatusDelete.ONLY) {
      query.andWhere('feature.deletedAt IS NOT NULL')
    }

    if (search) {
      query.andWhere(`(feature.code ILIKE :search OR feature.name ILIKE :search)`, { search: `%${search}%` })
    }

    if (orderBy && orderBy.length > 0) {
      for (const item of orderBy) {
        const columnMap: Record<string, string> = {
          code: 'feature.code',
          name: 'feature.name',
          createdAt: 'feature.createdAt',
          updatedAt: 'feature.updatedAt',
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
      query.addOrderBy('feature.updatedAt', 'DESC')
    }

    return query
  }
}