import { MigrationInterface, QueryRunner } from "typeorm";

export class CreatePhoneCodeTable1794062465182 implements MigrationInterface {
    name = 'CreatePhoneCodeTable1794062465182'
    tableSchema = 'master'
    tableName = 'phoneCodes'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "${this.tableSchema}"."${this.tableName}" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "countryId" uuid NOT NULL,

                "code" varchar NOT NULL,
                "isActive" boolean DEFAULT TRUE,
                
                "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP WITH TIME ZONE NULL,
                
                CONSTRAINT "PK_${this.tableName}_id"
                    PRIMARY KEY ("id"),
                CONSTRAINT "FK_${this.tableName}_countries_countryId"
                    FOREIGN KEY ("countryId")
                    REFERENCES "region"."countries"("id")
                    ON DELETE CASCADE
                    ON UPDATE CASCADE,
                CONSTRAINT "UQ_${this.tableName}_code"
                    UNIQUE ("code")
            )`)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "${this.tableSchema}"."${this.tableName}"`)
    }

}
