import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateFeaturePermissionTable1792057166072 implements MigrationInterface {
    name = 'CreateFeaturePermissionTable1792057166072'
    tableSchema = 'access'
    tableName = 'featurePermissions'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "${this.tableSchema}"."${this.tableName}" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "featureId" uuid NOT NULL,
                "featureActionId" uuid NOT NULL,
                
                "isActive" BOOLEAN NOT NULL default TRUE,
                "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP WITH TIME ZONE NULL,
                
                CONSTRAINT "PK_${this.tableName}_id"
                    PRIMARY KEY ("id"),
                CONSTRAINT "UQ_${this.tableName}_featureId_featureActionId"
                    UNIQUE ("featureId", "featureActionId"),
                CONSTRAINT "FK_${this.tableName}_features_featureId"
                    FOREIGN KEY ("featureId") 
                    REFERENCES "access"."features"("id")
                    ON DELETE CASCADE
                    ON UPDATE CASCADE,
                CONSTRAINT "FK_${this.tableName}_featureActions_featureActionId"
                    FOREIGN KEY ("featureActionId") 
                    REFERENCES "access"."featureActions"("id")
                    ON DELETE CASCADE
                    ON UPDATE CASCADE
            )`)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "${this.tableSchema}"."${this.tableName}"`)
    }

}
