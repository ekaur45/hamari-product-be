import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangeRelation1768924720270 implements MigrationInterface {
    name = 'ChangeRelation1768924720270'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`REL_00f8849f9ca826528796748dd9\` ON \`user_details\``);
        await queryRunner.query(`ALTER TABLE \`user_details\` ADD CONSTRAINT \`FK_5261d2468b1288b347d58e8b540\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user_details\` DROP FOREIGN KEY \`FK_5261d2468b1288b347d58e8b540\``);
        await queryRunner.query(`CREATE UNIQUE INDEX \`REL_00f8849f9ca826528796748dd9\` ON \`user_details\` (\`nationalityId\`)`);
    }

}
