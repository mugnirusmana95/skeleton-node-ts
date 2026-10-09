import { MigrationInterface, QueryRunner } from "typeorm"

export class CreateRoleTable1791445189808 implements MigrationInterface {
    name = 'CreateRoleTable1791445189808'
    tableSchema = 'public'
    tableName = 'roles'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "${this.tableSchema}"."${this.tableName}" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "code" character varying NOT NULL,
                "name" character varying NOT NULL,
                "isActive" BOOLEAN default TRUE,
                "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP WITH TIME ZONE NULL,
                
                CONSTRAINT "PK_roles_id" PRIMARY KEY ("id"),
                CONSTRAINT "UQ_users_code" UNIQUE ("code"),
                CONSTRAINT "UQ_users_name" UNIQUE ("name")
            )`)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "${this.tableSchema}"."${this.tableName}"`)
    }

}
