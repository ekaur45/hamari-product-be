import { MigrationInterface, QueryRunner } from "typeorm";

export class AddMoreFieldsToTeacher1768416386767 implements MigrationInterface {
    name = 'AddMoreFieldsToTeacher1768416386767'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`IDX_00f8849f9ca826528796748dd9\` ON \`user_details\``);
        await queryRunner.query(`ALTER TABLE \`teachers\` ADD \`introduction\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`teachers\` ADD \`introductionVideoUrl\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`teachers\` ADD \`introductionVideoThumbnailUrl\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`teachers\` ADD \`introductionVideoTitle\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`teachers\` ADD \`introductionVideoDescription\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`teachers\` DROP COLUMN \`yearsOfExperience\``);
        await queryRunner.query(`ALTER TABLE \`teachers\` ADD \`yearsOfExperience\` varchar(255) NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`teachers\` DROP COLUMN \`yearsOfExperience\``);
        await queryRunner.query(`ALTER TABLE \`teachers\` ADD \`yearsOfExperience\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`teachers\` DROP COLUMN \`introductionVideoDescription\``);
        await queryRunner.query(`ALTER TABLE \`teachers\` DROP COLUMN \`introductionVideoTitle\``);
        await queryRunner.query(`ALTER TABLE \`teachers\` DROP COLUMN \`introductionVideoThumbnailUrl\``);
        await queryRunner.query(`ALTER TABLE \`teachers\` DROP COLUMN \`introductionVideoUrl\``);
        await queryRunner.query(`ALTER TABLE \`teachers\` DROP COLUMN \`introduction\``);
        await queryRunner.query(`CREATE UNIQUE INDEX \`IDX_00f8849f9ca826528796748dd9\` ON \`user_details\` (\`nationalityId\`)`);
    }

}
