import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateCountryTable1794062452411 implements MigrationInterface {
    name = 'CreateCountryTable1794062452411'
    tableSchema = 'region'
    tableName = 'countries'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE SCHEMA IF NOT EXISTS "${this.tableSchema}"`)

        await queryRunner.query(`
            CREATE TABLE "${this.tableSchema}"."${this.tableName}" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),

                "code" varchar NOT NULL,
                "name" varchar NOT NULL,
                "latitude" float NULL,
                "longitude" float NULL,
                "isActive" boolean DEFAULT TRUE,

                "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP WITH TIME ZONE NULL,
                
                CONSTRAINT "PK_${this.tableName}_id"
                    PRIMARY KEY ("id"),
                CONSTRAINT "UQ_${this.tableName}_code"
                    UNIQUE ("code")
            )`)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "${this.tableSchema}"."${this.tableName}"`)
    }

}
