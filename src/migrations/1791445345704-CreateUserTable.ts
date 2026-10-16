import { MigrationInterface, QueryRunner } from "typeorm"

export class CreateUserTable1791445345704 implements MigrationInterface {
    name = 'CreateUserTable1791445345704'
    tableSchema = 'public'
    tableName = 'users'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "${this.tableSchema}"."${this.tableName}" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "roleId" uuid NOT NULL,

                "email" character varying NOT NULL,
                "password" character varying NOT NULL,
                "status" integer NOT NULL DEFAULT 1,
                "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP WITH TIME ZONE NULL,
                
                CONSTRAINT "PK_${this.tableName}_id"
                    PRIMARY KEY ("id"),
                CONSTRAINT "UQ_${this.tableName}_email"
                    UNIQUE ("email"),
                CONSTRAINT "FK_${this.tableName}_roles_roleId"
                    FOREIGN KEY ("roleId") 
                    REFERENCES "public"."roles"("id")
                    ON DELETE CASCADE
                    ON UPDATE CASCADE
            )`)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "${this.tableSchema}"."${this.tableName}"`)
    }

}
