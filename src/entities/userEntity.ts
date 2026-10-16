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
  OneToMany
} from 'typeorm'

import { Role } from '~/entities/roleEntity'
import { Profile } from '~/entities/profileEntity'
import { UserToken } from '~/entities/userTokenEntity'

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
    if (typeof this.status === 'undefined') {
      delete this.statusText
    } else {
      this.statusText = EUserStatusEntity[this.status] || 'UNKNOWN'
    }
  }

  @AfterLoad()
  computeIsDeleted() {
    if (typeof this.deletedAt === 'undefined') {
      delete this.isDeleted
    } else {
      this.isDeleted = this.deletedAt ? true : false
    }
  }
}