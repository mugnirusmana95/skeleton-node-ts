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

import { EStatusDelete, TOrderDirectionType, TParsedParams } from '~/helpers/paramHelper'
import { Province } from '~/entities/provinceEntity'
import { PhoneCode } from '~/entities/phoneCodeEntity'

@Entity({ schema: 'region', name: 'countries' })
export class Country {
  @PrimaryGeneratedColumn("uuid")
  id!: string

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

  @OneToMany(
    () => Province,
    (model) => model.country
  )
  provinces!: Province[]

  @OneToMany(
    () => PhoneCode,
    (model) => model.country
  )
  phoneCodes!: PhoneCode[]

  static filterList(
    query: SelectQueryBuilder<Country>,
    params: TParsedParams
  ): SelectQueryBuilder<Country> {
    const { statusDelete, search, isActive, orderBy } = params

    if (statusDelete === EStatusDelete.WITH || statusDelete === EStatusDelete.ONLY) {
      query
        .withDeleted()
        .addSelect('country.deletedAt')
    }

    if (statusDelete === EStatusDelete.ONLY) {
      query.andWhere('country.deletedAt IS NOT NULL')
    }

    if (search) {
      query.andWhere(
        `(country.code = :exact OR country.name ILIKE :like)`,
        { like: `%${search}%`, exact: search },
      )
    }

    if (isActive !== undefined) {
      query.andWhere(
        `(country.isActive = :isActive)`,
        { isActive }
      )
    }

    if (orderBy && orderBy.length > 0) {
      for (const item of orderBy) {
        const columnMap: Record<string, string> = {
          code: 'country.code',
          name: 'country.name',
          createdAt: 'country.createdAt',
          updatedAt: 'country.updatedAt',
        }

        const column = columnMap[item.column]

        if (column) {
          query.addOrderBy(
            column,
            item.direction.toUpperCase() as TOrderDirectionType,
          )
        }
      }
    } else {
      query.addOrderBy('country.name', 'ASC')
    }

    return query
  }
}