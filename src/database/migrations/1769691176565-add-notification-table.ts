import { MigrationInterface, QueryRunner } from "typeorm";

export class AddNotificationTable1769691176565 implements MigrationInterface {
    name = 'AddNotificationTable1769691176565'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`notifications\` (\`id\` varchar(36) NOT NULL, \`type\` varchar(255) NOT NULL, \`title\` varchar(255) NOT NULL, \`message\` varchar(255) NULL, \`isRead\` tinyint NOT NULL DEFAULT 0, \`redirectPath\` varchar(255) NULL, \`redirectParams\` json NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`userId\` varchar(36) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`notifications\` ADD CONSTRAINT \`FK_692a909ee0fa9383e7859f9b406\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`notifications\` DROP FOREIGN KEY \`FK_692a909ee0fa9383e7859f9b406\``);
        await queryRunner.query(`DROP TABLE \`notifications\``);
    }

}
