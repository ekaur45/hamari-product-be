import { MigrationInterface, QueryRunner } from "typeorm";

export class AddColumnToUser1769085473900 implements MigrationInterface {
    name = 'AddColumnToUser1769085473900'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`hasCompletedProfile\` tinyint NOT NULL DEFAULT 0`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`hasCompletedProfile\``);
    }

}
