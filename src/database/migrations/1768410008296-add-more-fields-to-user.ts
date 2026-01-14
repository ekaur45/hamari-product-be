import { MigrationInterface, QueryRunner } from "typeorm";

export class AddMoreFieldsToUser1768410008296 implements MigrationInterface {
    name = 'AddMoreFieldsToUser1768410008296'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user_details\` ADD \`nationalityId\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`user_details\` ADD UNIQUE INDEX \`IDX_00f8849f9ca826528796748dd9\` (\`nationalityId\`)`);
        await queryRunner.query(`ALTER TABLE \`user_details\` ADD \`gender\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`user_details\` ADD \`city\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`user_details\` ADD \`state\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`user_details\` ADD \`country\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`user_details\` ADD \`zipCode\` varchar(255) NULL`);
        await queryRunner.query(`CREATE UNIQUE INDEX \`REL_00f8849f9ca826528796748dd9\` ON \`user_details\` (\`nationalityId\`)`);
        await queryRunner.query(`ALTER TABLE \`user_details\` ADD CONSTRAINT \`FK_00f8849f9ca826528796748dd9d\` FOREIGN KEY (\`nationalityId\`) REFERENCES \`nationalities\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user_details\` DROP FOREIGN KEY \`FK_00f8849f9ca826528796748dd9d\``);
        await queryRunner.query(`DROP INDEX \`REL_00f8849f9ca826528796748dd9\` ON \`user_details\``);
        await queryRunner.query(`ALTER TABLE \`user_details\` DROP COLUMN \`zipCode\``);
        await queryRunner.query(`ALTER TABLE \`user_details\` DROP COLUMN \`country\``);
        await queryRunner.query(`ALTER TABLE \`user_details\` DROP COLUMN \`state\``);
        await queryRunner.query(`ALTER TABLE \`user_details\` DROP COLUMN \`city\``);
        await queryRunner.query(`ALTER TABLE \`user_details\` DROP COLUMN \`gender\``);
        await queryRunner.query(`ALTER TABLE \`user_details\` DROP INDEX \`IDX_00f8849f9ca826528796748dd9\``);
        await queryRunner.query(`ALTER TABLE \`user_details\` DROP COLUMN \`nationalityId\``);
    }

}
