import { MigrationInterface, QueryRunner } from "typeorm";

export class AddStudentidToAssignment1770123753451 implements MigrationInterface {
    name = 'AddStudentidToAssignment1770123753451'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`assignments\` ADD \`studentUserId\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`assignments\` ADD CONSTRAINT \`FK_b58d0f76288057d07bd10212e02\` FOREIGN KEY (\`studentUserId\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`assignments\` DROP FOREIGN KEY \`FK_b58d0f76288057d07bd10212e02\``);
        await queryRunner.query(`ALTER TABLE \`assignments\` DROP COLUMN \`studentUserId\``);
    }

}
