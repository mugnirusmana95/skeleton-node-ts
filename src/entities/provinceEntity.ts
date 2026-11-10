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
import { Country } from '~/entities/countryEntity'
import { Regency } from '~/entities/regencyEntity'

@Entity({ schema: 'region', name: 'provinces' })
export class Province {
  @PrimaryGeneratedColumn("uuid")
  id!: string

  @Column({ type: 'uuid' })
  countryId!: string

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
    () => Country,
    (model) => model.provinces
  )
  @JoinColumn({ name: 'countryId' })
  country!: Province[]

  @OneToMany(
    () => Regency,
    (model) => model.province
  )
  regencies!: Regency[]

  static filterList(
    query: SelectQueryBuilder<Province>,
    params: TParsedParams
  ): SelectQueryBuilder<Province> {
    const { statusDelete, search, orderBy } = params

    if (statusDelete === EStatusDelete.WITH || statusDelete === EStatusDelete.ONLY) {
      query
        .withDeleted()
        .addSelect('province.deletedAt')
    }

    if (statusDelete === EStatusDelete.ONLY) {
      query.andWhere('province.deletedAt IS NOT NULL')
    }

    if (search) {
      query.andWhere(
        `(province.code = :exact OR province.name ILIKE :like)`,
        { like: `%${search}%`, exact: search },
      )
    }

    if (orderBy && orderBy.length > 0) {
      const columnMap: Record<string, string> = {
        code: 'province.code',
        name: 'province.name',
        createdAt: 'province.createdAt',
        updatedAt: 'province.updatedAt',
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
      query.addOrderBy('province.name', 'ASC')
    }

    return query
  }
}