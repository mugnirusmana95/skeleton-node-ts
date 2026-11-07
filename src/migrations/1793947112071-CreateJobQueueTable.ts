import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateJobQueueTable1793947112071 implements MigrationInterface {
    name = 'CreateJobQueueTable1793947112071'
    tableSchema = 'public'
    tableName = 'jobQueues'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "${this.tableSchema}"."${this.tableName}" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),

                "jobId" varchar NOT NULL,
                "status" varchar NOT NULL,
                "payload" TEXT NULL,
                
                "scheduledAt" TIMESTAMP WITH TIME ZONE NULL,
                "executedAt" TIMESTAMP WITH TIME ZONE NULL,
                "completedAt" TIMESTAMP WITH TIME ZONE NULL,
                "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP WITH TIME ZONE NULL,
                
                CONSTRAINT "PK_${this.tableName}_id"
                    PRIMARY KEY ("id"),
                CONSTRAINT "UQ_${this.tableName}_jobId"
                    UNIQUE ("jobId")
            )`)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "${this.tableSchema}"."${this.tableName}"`)
    }

}
