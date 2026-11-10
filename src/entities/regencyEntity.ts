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

import { Province } from '~/entities/provinceEntity'
import { District } from '~/entities/districtEntity'

@Entity({ schema: 'region', name: 'regencies' })
export class Regency {
  @PrimaryGeneratedColumn("uuid")
  id!: string

  @Column({ type: 'uuid' })
  provinceId!: string

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
    () => Province,
    (model) => model.regencies
  )
  @JoinColumn({ name: 'provinceId' })
  province!: Province

  @OneToMany(
    () => District,
    (model) => model.regency,
  )
  districts!: District[]

  static filterList(
    query: SelectQueryBuilder<Regency>,
    params: TParsedParams
  ): SelectQueryBuilder<Regency> {
    const { statusDelete, search, orderBy } = params

    if (statusDelete === EStatusDelete.WITH || statusDelete === EStatusDelete.ONLY) {
      query
        .withDeleted()
        .addSelect('regency.deletedAt')
    }

    if (statusDelete === EStatusDelete.ONLY) {
      query.andWhere('regency.deletedAt IS NOT NULL')
    }

    if (search) {
      query.andWhere(
        `(regency.code = :exact OR regency.name ILIKE :like)`,
        { like: `%${search}%`, exact: search },
      )
    }

    if (orderBy && orderBy.length > 0) {
      const columnMap: Record<string, string> = {
        code: 'regency.code',
        name: 'regency.name',
        createdAt: 'regency.createdAt',
        updatedAt: 'regency.updatedAt',
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
      query.addOrderBy('regency.name', 'ASC')
    }

    return query
  }
}