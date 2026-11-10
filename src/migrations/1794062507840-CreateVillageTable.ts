import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateVillageTable1794062507840 implements MigrationInterface {
    name = 'CreateVillageTable1794062495116'
    tableSchema = 'region'
    tableName = 'villages'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "${this.tableSchema}"."${this.tableName}" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "districtId" uuid NOT NULL,

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
                CONSTRAINT "FK_${this.tableName}_districts_districtId"
                    FOREIGN KEY ("districtId") 
                    REFERENCES "region"."districts"("id")
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
