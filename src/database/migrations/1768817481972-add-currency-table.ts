import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCurrencyTable1768817481972 implements MigrationInterface {
    name = 'AddCurrencyTable1768817481972'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`currencies\` (\`id\` varchar(36) NOT NULL, \`code\` varchar(255) NOT NULL, \`name\` varchar(255) NOT NULL, \`symbol\` varchar(255) NOT NULL, \`exchangeRate\` decimal(10,2) NOT NULL, \`isBase\` tinyint NOT NULL DEFAULT 0, \`status\` enum ('active', 'inactive', 'suspended') NOT NULL DEFAULT 'active', \`isDeleted\` tinyint NOT NULL DEFAULT 0, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE \`currencies\``);
    }

}
