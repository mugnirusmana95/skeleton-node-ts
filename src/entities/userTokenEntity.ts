import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
  AfterLoad
} from 'typeorm'

import { User } from '~/entities/userEntity'

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
    if (typeof this.type === 'undefined') {
      delete this.typeText
    } else {
      this.typeText = EUserTokenTypeEntity[this.type] || 'UNKNOWN'
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