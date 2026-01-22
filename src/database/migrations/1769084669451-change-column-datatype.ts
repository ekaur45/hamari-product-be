import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangeColumnDatatype1769084669451 implements MigrationInterface {
    name = 'ChangeColumnDatatype1769084669451'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`teachers\` DROP COLUMN \`hourlyRate\``);
        await queryRunner.query(`ALTER TABLE \`teachers\` ADD \`hourlyRate\` decimal(10,2) NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`teachers\` DROP COLUMN \`hourlyRate\``);
        await queryRunner.query(`ALTER TABLE \`teachers\` ADD \`hourlyRate\` int NULL`);
    }

}
