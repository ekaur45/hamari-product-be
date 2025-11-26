import { MigrationInterface, QueryRunner } from "typeorm";

export class AddScheduleDaysToClass1763921451777 implements MigrationInterface {
    name = 'AddScheduleDaysToClass1763921451777'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`classes\` ADD \`scheduleDays\` json NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`classes\` DROP COLUMN \`scheduleDays\``);
    }

}
