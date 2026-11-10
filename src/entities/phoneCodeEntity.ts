import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  AfterLoad,
  SelectQueryBuilder,
  ManyToOne,
  JoinColumn
} from 'typeorm'

import { EStatusDelete, TParsedParams } from '~/helpers/paramHelper'
import { Country } from '~/entities/countryEntity'

@Entity({ schema: 'master', name: 'phoneCodes' })
export class PhoneCode {
  @PrimaryGeneratedColumn("uuid")
  id!: string

  @Column({ type: 'uuid' })
  countryId!: string

  @Column({ type: 'varchar' })
  code!: string

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
    (model) => model.phoneCodes
  )
  @JoinColumn({ name: 'countryId' })
  country!: Country[]

  static filterList(
    query: SelectQueryBuilder<PhoneCode>,
    params: TParsedParams
  ): SelectQueryBuilder<PhoneCode> {
    const { statusDelete, search, orderBy } = params

    query.leftJoinAndSelect('phoneCode.country', 'country')

    if (statusDelete === EStatusDelete.WITH || statusDelete === EStatusDelete.ONLY) {
      query
        .withDeleted()
        .addSelect('phoneCode.deletedAt')
        .addSelect("country.deletedAt")
    }

    if (statusDelete === EStatusDelete.ONLY) {
      query.andWhere('phoneCode.deletedAt IS NOT NULL')
    }

    if (search) {
      query.andWhere(
        `(phoneCode.code ILIKE :like OR country.code = :exact OR country.name ILIKE :like)`,
        { like: `%${search}%`, exact: search },
      )
    }

    if (orderBy && orderBy.length > 0) {
      for (const item of orderBy) {
        const columnMap: Record<string, string> = {
          code: 'phoneCode.code',
          countryCode: 'country.code',
          countryName: 'country.name',
          createdAt: 'phoneCode.createdAt',
          updatedAt: 'phoneCode.updatedAt',
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
      query.addOrderBy('country.name', 'ASC')
    }

    return query
  }
}