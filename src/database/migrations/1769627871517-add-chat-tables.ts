import { MigrationInterface, QueryRunner } from "typeorm";

export class AddChatTables1769627871517 implements MigrationInterface {
    name = 'AddChatTables1769627871517'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`chats\` (\`id\` varchar(36) NOT NULL, \`senderId\` varchar(255) NOT NULL, \`receiverId\` varchar(255) NOT NULL, \`message\` text NULL, \`isUnsent\` tinyint NOT NULL DEFAULT 0, \`isRead\` tinyint NOT NULL DEFAULT 0, \`isDeleted\` tinyint NOT NULL DEFAULT 0, \`createdAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, \`updatedAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`chat_resources\` ADD CONSTRAINT \`FK_4973f095111ac82075e355eb323\` FOREIGN KEY (\`chatId\`) REFERENCES \`chats\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`chats\` ADD CONSTRAINT \`FK_d697f19c9c7778ed773b449ce70\` FOREIGN KEY (\`senderId\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`chats\` ADD CONSTRAINT \`FK_c8562e07e5260b76b37e25126c6\` FOREIGN KEY (\`receiverId\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`chats\` DROP FOREIGN KEY \`FK_c8562e07e5260b76b37e25126c6\``);
        await queryRunner.query(`ALTER TABLE \`chats\` DROP FOREIGN KEY \`FK_d697f19c9c7778ed773b449ce70\``);
        await queryRunner.query(`ALTER TABLE \`chat_resources\` DROP FOREIGN KEY \`FK_4973f095111ac82075e355eb323\``);
        await queryRunner.query(`DROP TABLE \`chats\``);
    }

}
