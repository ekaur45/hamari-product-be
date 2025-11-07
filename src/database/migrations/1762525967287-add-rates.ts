import { MigrationInterface, QueryRunner } from "typeorm";

export class AddRates1762525967287 implements MigrationInterface {
    name = 'AddRates1762525967287'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` DROP FOREIGN KEY \`FK_a8687924ae4d52f05db87f3352f\``);
        await queryRunner.query(`DROP INDEX \`REL_a8687924ae4d52f05db87f3352\` ON \`users\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`detailsId\``);
        await queryRunner.query(`ALTER TABLE \`teacher_subjects\` ADD \`hourlyRate\` decimal(10,2) NULL`);
        await queryRunner.query(`ALTER TABLE \`teacher_subjects\` ADD \`monthlyRate\` decimal(10,2) NULL`);
        await queryRunner.query(`ALTER TABLE \`teachers\` ADD \`monthlyRate\` decimal(10,2) NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`teachers\` DROP COLUMN \`monthlyRate\``);
        await queryRunner.query(`ALTER TABLE \`teacher_subjects\` DROP COLUMN \`monthlyRate\``);
        await queryRunner.query(`ALTER TABLE \`teacher_subjects\` DROP COLUMN \`hourlyRate\``);
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`detailsId\` varchar(36) NULL`);
        await queryRunner.query(`CREATE UNIQUE INDEX \`REL_a8687924ae4d52f05db87f3352\` ON \`users\` (\`detailsId\`)`);
        await queryRunner.query(`ALTER TABLE \`users\` ADD CONSTRAINT \`FK_a8687924ae4d52f05db87f3352f\` FOREIGN KEY (\`detailsId\`) REFERENCES \`user_details\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
