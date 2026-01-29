import { MigrationInterface, QueryRunner } from "typeorm";

export class AddConversationTable1769672622436 implements MigrationInterface {
    name = 'AddConversationTable1769672622436'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`conversations\` (\`id\` varchar(36) NOT NULL, \`name\` varchar(255) NULL, \`createdAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, \`updatedAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, \`isDeleted\` tinyint NOT NULL DEFAULT 0, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`conversation_participants\` (\`conversationsId\` varchar(36) NOT NULL, \`usersId\` varchar(36) NOT NULL, INDEX \`IDX_65805cb4be5ab7593bdfc5419f\` (\`conversationsId\`), INDEX \`IDX_1af1e5a43828393f6ea24dd56f\` (\`usersId\`), PRIMARY KEY (\`conversationsId\`, \`usersId\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`chats\` ADD \`conversationId\` varchar(36) NULL`);
        await queryRunner.query(`ALTER TABLE \`chats\` ADD CONSTRAINT \`FK_40f8d393c072f457d4a9b6dbe20\` FOREIGN KEY (\`conversationId\`) REFERENCES \`conversations\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`conversation_participants\` ADD CONSTRAINT \`FK_65805cb4be5ab7593bdfc5419f5\` FOREIGN KEY (\`conversationsId\`) REFERENCES \`conversations\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`conversation_participants\` ADD CONSTRAINT \`FK_1af1e5a43828393f6ea24dd56f2\` FOREIGN KEY (\`usersId\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`conversation_participants\` DROP FOREIGN KEY \`FK_1af1e5a43828393f6ea24dd56f2\``);
        await queryRunner.query(`ALTER TABLE \`conversation_participants\` DROP FOREIGN KEY \`FK_65805cb4be5ab7593bdfc5419f5\``);
        await queryRunner.query(`ALTER TABLE \`chats\` DROP FOREIGN KEY \`FK_40f8d393c072f457d4a9b6dbe20\``);
        await queryRunner.query(`ALTER TABLE \`chats\` DROP COLUMN \`conversationId\``);
        await queryRunner.query(`DROP INDEX \`IDX_1af1e5a43828393f6ea24dd56f\` ON \`conversation_participants\``);
        await queryRunner.query(`DROP INDEX \`IDX_65805cb4be5ab7593bdfc5419f\` ON \`conversation_participants\``);
        await queryRunner.query(`DROP TABLE \`conversation_participants\``);
        await queryRunner.query(`DROP TABLE \`conversations\``);
    }

}
