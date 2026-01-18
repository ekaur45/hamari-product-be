import { MigrationInterface, QueryRunner } from "typeorm";

export class AddlogtableAnother1768757077496 implements MigrationInterface {
    name = 'AddlogtableAnother1768757077496'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`bookpayment_logs\` (\`id\` varchar(36) NOT NULL, \`bookingId\` varchar(255) NOT NULL, \`amount\` decimal(10,2) NOT NULL, \`currency\` varchar(50) NULL, \`paymentMethod\` varchar(255) NULL, \`transactionId\` varchar(255) NULL, \`status\` varchar(255) NULL, \`processedAt\` timestamp NULL, \`failureReason\` varchar(255) NULL, \`isDeleted\` tinyint NOT NULL DEFAULT 0, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`bookpayment_logs\` ADD CONSTRAINT \`FK_27f905dbf27d7544bafc6657b79\` FOREIGN KEY (\`bookingId\`) REFERENCES \`teacher_bookings\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`bookpayment_logs\` DROP FOREIGN KEY \`FK_27f905dbf27d7544bafc6657b79\``);
        await queryRunner.query(`DROP TABLE \`bookpayment_logs\``);
    }

}
