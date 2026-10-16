import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateUserTokenTable1791961056127 implements MigrationInterface {
    name = 'CreateUserTokenTable1791961056127'
    tableSchema = 'public'
    tableName = 'userTokens'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "${this.tableSchema}"."${this.tableName}" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "userId" uuid NOT NULL,
                
                "type" integer NULL,
                "isActive" BOOLEAN default TRUE,
                "token" text NOT NULL,
                "expiredAt" TIMESTAMP WITH TIME ZONE NOT NULL,
                
                "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP WITH TIME ZONE NULL,

                CONSTRAINT "PK_${this.tableName}_id"
                    PRIMARY KEY ("id"),
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
