import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
  AfterLoad,
  SelectQueryBuilder
} from 'typeorm'

import { User } from '~/entities/userEntity'
import { EStatusDelete, TParsedParams } from '~/helpers/paramHelper'

export enum EUserTokenTypeEntity {
  AUTH = 1,
  ACCOUUNT_ACTIVATION = 2,
  CHANGE_PASSWORD = 3,
}

@Entity({ schema: 'public', name: 'userTokens' })
export class UserToken {
  @PrimaryGeneratedColumn("uuid")
  id!: string

  @Column({ type: 'varchar' })
  userId!: string

  @Column({ type: 'integer' })
  type!: EUserTokenTypeEntity

  typeText?: string

  @Column({ type: 'boolean' })
  isActive!: boolean

  @Column({ type: 'text' })
  token!: string

  @Column({ type: 'timestamptz' })
  expiredAt!: Date

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date

  @DeleteDateColumn({ nullable: true, type: 'timestamp', select: false })
  deletedAt?: Date

  isDeleted?: boolean

  @ManyToOne(
    () => User,
    (model) => model.userTokens
  )
  @JoinColumn({ name: 'userId' })
  user!: User

  @AfterLoad()
  computeStatusText() {
    if (typeof this.type === 'undefined' || !this.type) {
      delete this.typeText
    } else {
      this.typeText = EUserTokenTypeEntity[this.type] || 'UNKNOWN'
    }
  }

  @AfterLoad()
  computeIsDeleted() {
    if (typeof this.deletedAt === 'undefined' || !this.deletedAt) {
      delete this.isDeleted
    } else {
      this.isDeleted = this.deletedAt ? true : false
    }
  }

  static filterList(
    query: SelectQueryBuilder<UserToken>,
    params: TParsedParams
  ): SelectQueryBuilder<UserToken> {
    const { statusDelete, search, userId, orderBy } = params

    query
      .leftJoinAndSelect('userToken.user', 'user')

    if (statusDelete === EStatusDelete.WITH || statusDelete === EStatusDelete.ONLY) {
      query
        .withDeleted()
        .addSelect('userToken.deletedAt')
        .addSelect('user.deletedAt')
    }

    if (statusDelete === EStatusDelete.ONLY) {
      query.andWhere('userToken.deletedAt IS NOT NULL')
    }

    if (search) {
      query.andWhere(`userToken.email ILIKE :search`, { search })
    }

    if (userId) {
      query.andWhere(`userId = :userId`, { userId })
    }

    if (orderBy && orderBy.length > 0) {
      for (const item of orderBy) {
        const columnMap: Record<string, string> = {
          firstName: 'userToken.firstName',
          middleName: 'userToken.middleName',
          lastName: 'userToken.lastName',
          phoneCode: 'userToken.phoneCode',
          phoneNumber: 'userToken.phoneNumber',
          userEmail: 'user.email',
          createdAt: 'userToken.createdAt',
          updatedAt: 'userToken.updatedAt',
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
      query.addOrderBy('userToken.updatedAt', 'DESC')
    }

    return query
  }
}