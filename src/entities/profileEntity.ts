import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  JoinColumn,
  AfterLoad,
  OneToOne
} from 'typeorm'

import { User } from '~/entities/userEntity'

@Entity({ schema: 'public', name: 'profiles' })
export class Profile {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ type: 'varchar' })
  userId!: string

  @Column({ type: 'varchar' })
  firstName!: string

  @Column({ type: 'varchar' })
  middleName?: string

  @Column({ type: 'varchar' })
  lastName?: string

  fullName?: string

  @Column({ type: 'varchar' })
  phoneCode?: string

  @Column({ type: 'varchar' })
  phoneNumber?: string

  fullPhone?: string

  @Column({ type: 'varchar' })
  address?: string

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date

  @DeleteDateColumn({ nullable: true, type: 'timestamp', select: false })
  deletedAt?: Date

  isDeleted?: boolean

  @OneToOne(() => User, (user) => user.profile)
  @JoinColumn({ name: 'userId' })
  user: User

  @AfterLoad()
  computeFullName() {
    if (
      typeof this.firstName === 'undefined' &&
      typeof this.middleName === 'undefined' &&
      typeof this.lastName === 'undefined'
    ) {
      delete this.fullName
    } else {
      this.fullName = [this.firstName, this.middleName, this.lastName]
        .filter((name) => name?.trim())
        .join(' ')
    }
  }

  @AfterLoad()
  computeFullPhone() {
    if (
      typeof this.phoneCode === 'undefined' &&
      typeof this.phoneNumber === 'undefined'
    ) {
      delete this.fullPhone
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
    if (typeof this.deletedAt === 'undefined') {
      delete this.isDeleted
    } else {
      this.isDeleted = this.deletedAt ? true : false
    }
  }
}