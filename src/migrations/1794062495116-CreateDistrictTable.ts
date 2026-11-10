import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateDistrictTable1794062495116 implements MigrationInterface {
    name = 'CreateDistrictTable1794062495116'
    tableSchema = 'region'
    tableName = 'districts'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "${this.tableSchema}"."${this.tableName}" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "regencyId" uuid NOT NULL,

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
                CONSTRAINT "FK_${this.tableName}_regencies_regencyId"
                    FOREIGN KEY ("regencyId") 
                    REFERENCES "region"."regencies"("id")
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
