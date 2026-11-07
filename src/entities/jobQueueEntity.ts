import { JobsOptions } from 'bullmq'
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  AfterLoad,
  SelectQueryBuilder
} from 'typeorm'

import { EStatusDelete, TParsedParams } from '~/helpers/paramHelper'

export enum EStatusJob {
  WAITING = 'waiting',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

export type TJobPayload<T = unknown> = {
  attemptsMade: number
  opts: JobsOptions
  payload: T
}

@Entity({ schema: 'public', name: 'jobQueues' })
export class JobQueue {
  @PrimaryGeneratedColumn("uuid")
  id!: string

  @Column({ type: 'varchar' })
  jobId!: string

  @Column({ type: 'varchar' })
  status!: EStatusJob

  @Column({ type: 'varchar' })
  payload!: string

  payloadParsed!: TJobPayload

  @Column({ type: 'timestamptz', nullable: true })
  scheduledAt?: Date

  @Column({ type: 'timestamptz', nullable: true })
  executedAt?: Date

  @Column({ type: 'timestamptz', nullable: true })
  completedAt?: Date

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date

  @DeleteDateColumn({ nullable: true, type: 'timestamp', select: false })
  deletedAt?: Date

  isDeleted?: boolean

  @AfterLoad()
  computePayloadParsed() {
    this.payloadParsed = JSON.parse(this.payload)
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
    query: SelectQueryBuilder<JobQueue>,
    params: TParsedParams
  ): SelectQueryBuilder<JobQueue> {
    const { statusDelete, search, orderBy } = params

    query

    if (statusDelete === EStatusDelete.WITH || statusDelete === EStatusDelete.ONLY) {
      query
        .withDeleted()
        .addSelect('jobQueue.deletedAt')
    }

    if (statusDelete === EStatusDelete.ONLY) {
      query.andWhere('jobQueue.deletedAt IS NOT NULL')
    }

    if (search) {
      query.andWhere(`jobQueue.email ILIKE :search`, { search })
    }

    if (orderBy && orderBy.length > 0) {
      for (const item of orderBy) {
        const columnMap: Record<string, string> = {
          firstName: 'jobQueue.jobId',
          middleName: 'jobQueue.status',
          executedAt: 'jobQueue.executedAt',
          scheduledAt: 'jobQueue.scheduledAt',
          completedAt: 'jobQueue.completedAt',
          createdAt: 'jobQueue.createdAt',
          updatedAt: 'jobQueue.updatedAt',
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
      query.addOrderBy('jobQueue.updatedAt', 'DESC')
    }

    return query
  }
}