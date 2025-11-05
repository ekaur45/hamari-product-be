import { MigrationInterface, QueryRunner } from "typeorm";

export class StudentParentOptional1762336402881 implements MigrationInterface {
    name = 'StudentParentOptional1762336402881'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`students\` DROP FOREIGN KEY \`FK_6fea943b3b432a9e3e38d53c31b\``);
        await queryRunner.query(`ALTER TABLE \`students\` CHANGE \`parentId\` \`parentId\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`students\` ADD CONSTRAINT \`FK_6fea943b3b432a9e3e38d53c31b\` FOREIGN KEY (\`parentId\`) REFERENCES \`parents\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`students\` DROP FOREIGN KEY \`FK_6fea943b3b432a9e3e38d53c31b\``);
        await queryRunner.query(`ALTER TABLE \`students\` CHANGE \`parentId\` \`parentId\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`students\` ADD CONSTRAINT \`FK_6fea943b3b432a9e3e38d53c31b\` FOREIGN KEY (\`parentId\`) REFERENCES \`parents\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
