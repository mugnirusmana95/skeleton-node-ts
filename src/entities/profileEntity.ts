import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  JoinColumn,
  AfterLoad,
  OneToOne,
  SelectQueryBuilder
} from 'typeorm'

import { User } from '~/entities/userEntity'
import { EStatusDelete, TParsedParams } from '~/helpers/paramHelper'

@Entity({ schema: 'public', name: 'profiles' })
export class Profile {
  @PrimaryGeneratedColumn("uuid")
  id!: string

  @Column({ type: 'varchar' })
  userId!: string

  @Column({ type: 'varchar' })
  firstName!: string

  @Column({ type: 'varchar' })
  middleName?: string

  @Column({ type: 'varchar' })
  lastName?: string

  fullName?: string | null

  @Column({ type: 'varchar' })
  phoneCode?: string

  @Column({ type: 'varchar' })
  phoneNumber?: string

  fullPhone?: string | null

  @Column({ type: 'varchar' })
  address?: string

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date

  @DeleteDateColumn({ nullable: true, type: 'timestamp', select: false })
  deletedAt?: Date

  isDeleted?: boolean

  @OneToOne(
    () => User,
    (model) => model.profile
  )
  @JoinColumn({ name: 'userId' })
  user: User

  @AfterLoad()
  computeFullName() {
    if (
      !this.firstName &&
      !this.middleName &&
      !this.lastName
    ) {
      this.fullName = null
    } else {
      this.fullName = [this.firstName, this.middleName, this.lastName]
        .filter((name) => name?.trim())
        .join(' ')
    }
  }

  @AfterLoad()
  computeFullPhone() {
    if (!this.phoneCode && !this.phoneNumber) {
      this.fullPhone = null
    } else {
      const phone = this.phoneCode && this.phoneNumber
        ? [this.phoneCode, this.phoneNumber]
        : []

      this.fullPhone = phone
        .filter((value) => value?.trim())
        .join('')
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
    query: SelectQueryBuilder<Profile>,
    params: TParsedParams
  ): SelectQueryBuilder<Profile> {
    const { statusDelete, search, userId, orderBy } = params

    query
      .leftJoinAndSelect('profile.user', 'user')

    if (statusDelete === EStatusDelete.WITH || statusDelete === EStatusDelete.ONLY) {
      query
        .withDeleted()
        .addSelect('profile.deletedAt')
        .addSelect('user.deletedAt')
    }

    if (statusDelete === EStatusDelete.ONLY) {
      query.andWhere('profile.deletedAt IS NOT NULL')
    }

    if (search) {
      query.andWhere(`profile.email ILIKE :search`, { search })
    }
    if (userId) {
      query.andWhere(`profile.userId = :userId`, { userId })
    }

    if (orderBy && orderBy.length > 0) {
      for (const item of orderBy) {
        const columnMap: Record<string, string> = {
          firstName: 'profile.firstName',
          middleName: 'profile.middleName',
          lastName: 'profile.lastName',
          phoneCode: 'profile.phoneCode',
          phoneNumber: 'profile.phoneNumber',
          userEmail: 'user.email',
          createdAt: 'profile.createdAt',
          updatedAt: 'profile.updatedAt',
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
      query.addOrderBy('profile.updatedAt', 'DESC')
    }

    return query
  }
}