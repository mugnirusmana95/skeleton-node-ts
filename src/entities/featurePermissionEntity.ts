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
  OneToMany,
  SelectQueryBuilder
} from 'typeorm'

import { Feature } from '~/entities/featureEntity'
import { FeatureAction } from '~/entities/featureActionEntity'
import { RolePermission } from './rolePermissionEntity'
import { EStatusDelete, TParsedParams } from '~/helpers/paramHelper'

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
    if (typeof this.deletedAt === 'undefined' || !this.deletedAt) {
      delete this.isDeleted
    } else {
      this.isDeleted = this.deletedAt ? true : false
    }
  }

  static filterList(
    query: SelectQueryBuilder<FeaturePermission>,
    params: TParsedParams
  ): SelectQueryBuilder<FeaturePermission> {
    const { statusDelete, search, orderBy } = params

    query
      .leftJoinAndSelect('featurePermission.feature', 'feature')
      .leftJoinAndSelect('featurePermission.featureAction', 'featureAction')

    if (statusDelete === EStatusDelete.WITH || statusDelete === EStatusDelete.ONLY) {
      query
        .withDeleted()
        .addSelect('featurePermission.deletedAt')
        .addSelect('feature.deletedAt')
        .addSelect('featureAction.deletedAt')
    }

    if (statusDelete === EStatusDelete.ONLY) {
      query.andWhere('featurePermission.deletedAt IS NOT NULL')
    }

    if (search) {
      query.andWhere(`(featurePermission.code ILIKE :search OR featurePermission.name ILIKE :search)`, { search: `%${search}%` })
    }

    if (orderBy && orderBy.length > 0) {
      for (const item of orderBy) {
        const columnMap: Record<string, string> = {
          featureId: 'featurePermission.featureId',
          featureName: 'feature.name',
          featureActionId: 'featurePermission.featureActionId',
          featureActionName: 'featureAction.name',
          createdAt: 'featurePermission.createdAt',
          updatedAt: 'featurePermission.updatedAt',
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
      query.addOrderBy('featurePermission.updatedAt', 'DESC')
    }

    return query
  }
}