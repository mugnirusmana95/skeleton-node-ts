import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateRolePermissionTable1792057319355 implements MigrationInterface {
    name = 'CreateRolePermissionTable1792057319355'
    tableSchema = 'access'
    tableName = 'rolePermissions'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "${this.tableSchema}"."${this.tableName}" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "roleId" uuid NOT NULL,
                "featurePermissionId" uuid NOT NULL,
                
                "isActive" BOOLEAN NOT NULL default TRUE,
                "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP WITH TIME ZONE NULL,
                
                CONSTRAINT "PK_${this.tableName}_id"
                    PRIMARY KEY ("id"),
                CONSTRAINT "UQ_${this.tableName}_roleId_featurePermissionId"
                    UNIQUE ("roleId", "featurePermissionId"),
                CONSTRAINT "FK_${this.tableName}_roles_roleId"
                    FOREIGN KEY ("roleId") 
                    REFERENCES "public"."roles"("id")
                    ON DELETE CASCADE
                    ON UPDATE CASCADE,
                CONSTRAINT "FK_${this.tableName}_featurePermissions_featurePermissionId"
                    FOREIGN KEY ("featurePermissionId") 
                    REFERENCES "access"."featurePermissions"("id")
                    ON DELETE CASCADE
                    ON UPDATE CASCADE
            )`)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "${this.tableSchema}"."${this.tableName}"`)
    }

}
