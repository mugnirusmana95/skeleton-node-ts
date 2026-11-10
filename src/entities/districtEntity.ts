import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  AfterLoad,
  OneToMany,
  SelectQueryBuilder,
  ManyToOne,
  JoinColumn
} from 'typeorm'

import { EStatusDelete, TOrderDirectionType, TParsedParams } from '~/helpers/paramHelper'
import { Regency } from '~/entities/regencyEntity'
import { Village } from '~/entities/villageEntity'

@Entity({ schema: 'region', name: 'districts' })
export class District {
  @PrimaryGeneratedColumn("uuid")
  id!: string

  @Column({ type: 'uuid' })
  regencyId!: string

  @Column({ type: 'varchar' })
  code!: string

  @Column({ type: 'varchar' })
  name!: string

  @Column({ type: 'float' })
  latitude?: number

  @Column({ type: 'float' })
  longitude?: number

  @Column({ type: 'boolean' })
  isActive!: boolean

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt!: Date

  @DeleteDateColumn({ nullable: true, type: 'timestamp', select: false })
  deletedAt?: Date

  isDeleted?: boolean

  @AfterLoad()
  computeIsDeleted() {
    if (typeof this.deletedAt === 'undefined' || !this.deletedAt) {
      delete this.isDeleted
    } else {
      this.isDeleted = this.deletedAt ? true : false
    }
  }

  @ManyToOne(
    () => Regency,
    (model) => model.districts
  )
  @JoinColumn({ name: 'regencyId' })
  regency: Regency

  @OneToMany(
    () => Village,
    (model) => model.district,
  )
  villages!: Village[]

  static filterList(
    query: SelectQueryBuilder<District>,
    params: TParsedParams
  ): SelectQueryBuilder<District> {
    const { statusDelete, search, orderBy } = params

    if (statusDelete === EStatusDelete.WITH || statusDelete === EStatusDelete.ONLY) {
      query
        .withDeleted()
        .addSelect('district.deletedAt')
    }

    if (statusDelete === EStatusDelete.ONLY) {
      query.andWhere('district.deletedAt IS NOT NULL')
    }

    if (search) {
      query.andWhere(
        `(district.code = :exact OR district.name ILIKE :like)`,
        { like: `%${search}%`, exact: search },
      )
    }

    if (orderBy && orderBy.length > 0) {
      const columnMap: Record<string, string> = {
        code: 'district.code',
        name: 'district.name',
        createdAt: 'district.createdAt',
        updatedAt: 'district.updatedAt',
      }

      for (const item of orderBy) {
        const column = columnMap[item.column]

        if (column) {
          query.addOrderBy(
            column,
            item.direction.toUpperCase() as TOrderDirectionType,
          )
        }
      }
    } else {
      query.addOrderBy('district.name', 'ASC')
    }

    return query
  }
}