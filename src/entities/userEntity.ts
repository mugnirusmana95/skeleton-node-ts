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

import { Role } from '~/entities/roleEntity'

export enum EUserStatusEntity {
  INACTIVE = 1,
  ACTIVE = 2,
  DISABLED = 3,
  BANNED = 4
}

@Entity({ name: 'public.users' })
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ type: 'varchar' })
  email!: string

  @Column({ type: 'varchar', select: false })
  password!: string

  @Column({ type: 'uuid' })
  roleId!: string

  @Column({ type: 'integer' })
  status!: EUserStatusEntity

  statusText!: string

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date

  @DeleteDateColumn({ nullable: true, type: 'timestamp', select: false })
  deletedAt?: Date

  isDeleted?: boolean

  @ManyToOne(() => Role)
  @JoinColumn({ name: 'roleId' })
  role!: Role

  @AfterLoad()
  computeStatusText() {
    this.statusText = EUserStatusEntity[this.status] || 'UNKNOWN'
  }

  @AfterLoad()
  computeIsDeleted() {
    this.isDeleted = this.deletedAt ? true : false
  }
}