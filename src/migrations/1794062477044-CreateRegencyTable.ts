import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateRegencyTable1794062477044 implements MigrationInterface {
    name = 'CreateRegencyTable1794062477044'
    tableSchema = 'region'
    tableName = 'regencies'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "${this.tableSchema}"."${this.tableName}" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "provinceId" uuid NOT NULL,

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
                CONSTRAINT "FK_${this.tableName}_provinces_provinceId"
                    FOREIGN KEY ("provinceId") 
                    REFERENCES "region"."provinces"("id")
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
