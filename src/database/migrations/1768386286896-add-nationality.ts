import { MigrationInterface, QueryRunner } from "typeorm";

export class AddNationality1768386286896 implements MigrationInterface {
    name = 'AddNationality1768386286896'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`nationalities\` (\`id\` varchar(36) NOT NULL, \`name\` varchar(255) NOT NULL, \`code\` varchar(255) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE \`nationalities\``);
    }

}
