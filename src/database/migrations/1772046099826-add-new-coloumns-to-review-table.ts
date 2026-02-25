import { MigrationInterface, QueryRunner } from "typeorm";

export class AddNewColoumnsToReviewTable1772046099826 implements MigrationInterface {
    name = 'AddNewColoumnsToReviewTable1772046099826'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`reviews\` ADD \`punctuality\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`reviews\` ADD \`engagement\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`reviews\` ADD \`knowledge\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`reviews\` ADD \`communication\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`reviews\` ADD \`overallExperience\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`reviews\` CHANGE \`rating\` \`rating\` int NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`reviews\` CHANGE \`rating\` \`rating\` int NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`reviews\` DROP COLUMN \`overallExperience\``);
        await queryRunner.query(`ALTER TABLE \`reviews\` DROP COLUMN \`communication\``);
        await queryRunner.query(`ALTER TABLE \`reviews\` DROP COLUMN \`knowledge\``);
        await queryRunner.query(`ALTER TABLE \`reviews\` DROP COLUMN \`engagement\``);
        await queryRunner.query(`ALTER TABLE \`reviews\` DROP COLUMN \`punctuality\``);
    }

}
