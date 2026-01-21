import { MigrationInterface, QueryRunner } from "typeorm";

export class AddOtpTable1769022468320 implements MigrationInterface {
    name = 'AddOtpTable1769022468320'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`otps\` (\`id\` varchar(36) NOT NULL, \`userId\` varchar(255) NOT NULL, \`otp\` varchar(255) NOT NULL, \`type\` enum ('login', 'register', 'forgot_password', 'verify_email') NOT NULL, \`createdAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, \`updatedAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, \`expiresAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, \`isUsed\` tinyint NOT NULL DEFAULT 0, \`isDeleted\` tinyint NOT NULL DEFAULT 0, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`isEmailVerified\` tinyint NOT NULL DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE \`user_details\` ADD CONSTRAINT \`FK_00f8849f9ca826528796748dd9d\` FOREIGN KEY (\`nationalityId\`) REFERENCES \`nationalities\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`otps\` ADD CONSTRAINT \`FK_82b0deb105275568cdcef2823eb\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`otps\` DROP FOREIGN KEY \`FK_82b0deb105275568cdcef2823eb\``);
        await queryRunner.query(`ALTER TABLE \`user_details\` DROP FOREIGN KEY \`FK_00f8849f9ca826528796748dd9d\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`isEmailVerified\``);
        await queryRunner.query(`DROP TABLE \`otps\``);
    }

}
