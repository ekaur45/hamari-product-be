import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateLogTable1764177529725 implements MigrationInterface {
    name = 'CreateLogTable1764177529725'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`logs\` (\`id\` int NOT NULL AUTO_INCREMENT, \`level\` enum ('error', 'warn', 'info', 'debug', 'verbose') NOT NULL DEFAULT 'info', \`message\` text NOT NULL, \`context\` varchar(255) NULL, \`trace\` text NULL, \`metadata\` json NULL, \`timestamp\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), INDEX \`IDX_682897ba764db30ef8836c9b74\` (\`timestamp\`), INDEX \`IDX_10d65a4fb56f62db29ed1b1459\` (\`level\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`IDX_10d65a4fb56f62db29ed1b1459\` ON \`logs\``);
        await queryRunner.query(`DROP INDEX \`IDX_682897ba764db30ef8836c9b74\` ON \`logs\``);
        await queryRunner.query(`DROP TABLE \`logs\``);
    }

}
