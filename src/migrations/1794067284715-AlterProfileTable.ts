import { MigrationInterface, QueryRunner } from "typeorm";

export class AlterProfileTable1794067284715 implements MigrationInterface {
    name = 'AlterProfileTable1794067284715'
    tableSchema = 'public'
    tableName = 'profiles'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "${this.tableSchema}"."${this.tableName}"
                DROP COLUMN "phoneCode",
                ADD "phoneCodeId" uuid NULL,
                
                ADD CONSTRAINT "FK_${this.tableName}_phoneCodes_phoneCodeId"
                    FOREIGN KEY ("phoneCodeId") 
                    REFERENCES "master"."phoneCodes"("id")
                    ON DELETE CASCADE
                    ON UPDATE CASCADE
            `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "${this.tableSchema}"."${this.tableName}"
                DROP CONSTRAINT "FK_${this.tableName}_phoneCodes_phoneCodeId",
                DROP COLUMN "phoneCodeId",
                ADD COLUMN "phoneCode" character varying NULL
            `)
    }

}
