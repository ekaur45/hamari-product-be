import { MigrationInterface, QueryRunner } from "typeorm";

export class LinkReviewToBooking1771796820243 implements MigrationInterface {
    name = 'LinkReviewToBooking1771796820243'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`reviews\` ADD \`teacherBookingId\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`reviews\` ADD CONSTRAINT \`FK_c9c80543887f595d1955eede7a4\` FOREIGN KEY (\`teacherBookingId\`) REFERENCES \`teacher_bookings\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`reviews\` DROP FOREIGN KEY \`FK_c9c80543887f595d1955eede7a4\``);
        await queryRunner.query(`ALTER TABLE \`reviews\` DROP COLUMN \`teacherBookingId\``);
    }

}
