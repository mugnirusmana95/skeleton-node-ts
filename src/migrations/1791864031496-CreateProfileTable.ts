import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateProfileTable1791864031496 implements MigrationInterface {
    name = 'CreateProfileTable1791864031496'
    tableSchema = 'public'
    tableName = 'profiles'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "${this.tableSchema}"."${this.tableName}" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "userId" uuid NOT NULL,
                
                "firstName" character varying NOT NULL,
                "middleName" character varying NULL,
                "lastName" character varying NULL,
                "phoneCode" character varying NULL,
                "phoneNumber" character varying NULL,
                "address" character varying NULL,
                
                "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP WITH TIME ZONE NULL,
                
                CONSTRAINT "PK_${this.tableName}_id"
                    PRIMARY KEY ("id"),
                CONSTRAINT "UQ_${this.tableName}_userId"
                    UNIQUE ("userId"),
                CONSTRAINT "FK_${this.tableName}_users_userId"
                    FOREIGN KEY ("userId") 
                    REFERENCES "public"."users"("id")
                    ON DELETE CASCADE
                    ON UPDATE CASCADE
            )`)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "${this.tableSchema}"."${this.tableName}"`)
    }

}
