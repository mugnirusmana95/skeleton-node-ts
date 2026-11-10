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
import { District } from '~/entities/districtEntity'
import { ZipCode } from '~/entities/zipCodeEntity'

@Entity({ schema: 'region', name: 'villages' })
export class Village {
  @PrimaryGeneratedColumn("uuid")
  id!: string

  @Column({ type: 'uuid' })
  districtId!: string

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
    () => District,
    (model) => model.villages
  )
  @JoinColumn({ name: 'districtId' })
  district: District

  @OneToMany(
    () => ZipCode,
    (model) => model.village
  )
  zipCodes: ZipCode[]

  static filterList(
    query: SelectQueryBuilder<Village>,
    params: TParsedParams
  ): SelectQueryBuilder<Village> {
    const { statusDelete, search, orderBy } = params

    if (statusDelete === EStatusDelete.WITH || statusDelete === EStatusDelete.ONLY) {
      query
        .withDeleted()
        .addSelect('village.deletedAt')
    }

    if (statusDelete === EStatusDelete.ONLY) {
      query.andWhere('village.deletedAt IS NOT NULL')
    }

    if (search) {
      query.andWhere(
        `(village.code = :exact OR village.name ILIKE :like)`,
        { like: `%${search}%`, exact: search },
      )
    }

    if (orderBy && orderBy.length > 0) {
      const columnMap: Record<string, string> = {
        code: 'village.code',
        name: 'village.name',
        createdAt: 'village.createdAt',
        updatedAt: 'village.updatedAt',
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
      query.addOrderBy('village.name', 'ASC')
    }

    return query
  }
}