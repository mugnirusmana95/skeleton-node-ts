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
  OneToOne,
  OneToMany,
  SelectQueryBuilder
} from 'typeorm'

import { Role } from '~/entities/roleEntity'
import { Profile } from '~/entities/profileEntity'
import { UserToken } from '~/entities/userTokenEntity'
import { EStatusDelete, TParsedParams } from '~/helpers/paramHelper'

export enum EUserStatusEntity {
  INACTIVE = 1, // User inactive (first register)
  ACTIVE = 2,   // User active (activation after register)
  DISABLED = 3, // User disabled (temporarily inactive by admin / system)
  BANNED = 4    // User banned (permanent inactive by admin / system)
}

export const allowedUserStatusEntity = Object.values(EUserStatusEntity)
  .filter((val): val is number => typeof val === 'number')

export const allowedTextUserStatusEntity = Object.keys(EUserStatusEntity)
  .filter((key) => isNaN(Number(key)))
  .map((key) => `${EUserStatusEntity[key as keyof typeof EUserStatusEntity]} = ${key}`)
  .join(', ')

@Entity({ schema: 'public', name: 'users' })
export class User {
  @PrimaryGeneratedColumn("uuid")
  id!: string

  @Column({ type: 'varchar' })
  email!: string

  @Column({ type: 'varchar', select: false })
  password!: string

  @Column({ type: 'uuid' })
  roleId!: string

  @Column({ type: 'integer' })
  status!: EUserStatusEntity

  statusText?: string

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date

  @DeleteDateColumn({ nullable: true, type: 'timestamp', select: false })
  deletedAt?: Date

  isDeleted?: boolean

  @ManyToOne(
    () => Role,
    (model) => model.users
  )
  @JoinColumn({ name: 'roleId' })
  role!: Role

  @OneToOne(
    () => Profile,
    (model) => model.user
  )
  profile: Profile

  @OneToMany(
    () => UserToken,
    (model) => model.user
  )
  userTokens: UserToken[]

  @AfterLoad()
  computeStatusText() {
    if (typeof this.status === 'undefined' || !this.status) {
      delete this.statusText
    } else {
      this.statusText = EUserStatusEntity[this.status] || 'UNKNOWN'
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
    query: SelectQueryBuilder<User>,
    params: TParsedParams
  ): SelectQueryBuilder<User> {
    const { statusDelete, search, roleId, orderBy } = params

    query
      .leftJoinAndSelect('user.role', 'role')
      .leftJoinAndSelect('user.profile', 'profile')

    if (statusDelete === EStatusDelete.WITH || statusDelete === EStatusDelete.ONLY) {
      query
        .withDeleted()
        .addSelect('user.deletedAt')
        .addSelect('role.deletedAt')
        .addSelect('profile.deletedAt')
    }

    if (statusDelete === EStatusDelete.ONLY) {
      query.andWhere('user.deletedAt IS NOT NULL')
    }

    if (search) {
      query.andWhere(`(
        user.email ILIKE :search OR
        profile.firstName ILIKE :search OR
        profile.middleName ILIKE :search OR
        profile.lastName ILIKE :search OR
        profile.phoneCode ILIKE :search OR
        profile.phoneNumber ILIKE :search
      )`,
        { search: `%${search}%` })
    }

    if (roleId) {
      query.andWhere(`user.roleId = :roleId`, { roleId })
    }

    if (orderBy && orderBy.length > 0) {
      for (const item of orderBy) {
        const columnMap: Record<string, string> = {
          name: 'user.email',
          roleName: 'role.name',
          createdAt: 'user.createdAt',
          updatedAt: 'user.updatedAt',
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
      query.addOrderBy('user.updatedAt', 'DESC')
    }

    return query
  }
}