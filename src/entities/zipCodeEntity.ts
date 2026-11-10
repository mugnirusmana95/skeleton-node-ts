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
  ManyToOne
} from 'typeorm'

import { EStatusDelete, TOrderDirectionType, TParsedParams } from '~/helpers/paramHelper'
import { Village } from '~/entities/villageEntity'

@Entity({ schema: 'region', name: 'zipCodes' })
export class ZipCode {
  @PrimaryGeneratedColumn("uuid")
  id!: string

  @Column({ type: 'uuid' })
  villageId!: string

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
    () => Village,
    (model) => model.zipCodes
  )
  village: Village

  static filterList(
    query: SelectQueryBuilder<ZipCode>,
    params: TParsedParams
  ): SelectQueryBuilder<ZipCode> {
    const { statusDelete, search, orderBy } = params

    if (statusDelete === EStatusDelete.WITH || statusDelete === EStatusDelete.ONLY) {
      query
        .withDeleted()
        .addSelect('zipCode.deletedAt')
    }

    if (statusDelete === EStatusDelete.ONLY) {
      query.andWhere('zipCode.deletedAt IS NOT NULL')
    }

    if (search) {
      query.andWhere(
        `(zipCode.code = :search)`,
        { search },
      )
    }

    if (orderBy && orderBy.length > 0) {
      const columnMap: Record<string, string> = {
        code: 'zipCode.code',
        createdAt: 'zipCode.createdAt',
        updatedAt: 'zipCode.updatedAt',
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
      query.addOrderBy('zipCode.name', 'ASC')
    }

    return query
  }
}