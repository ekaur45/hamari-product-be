import { MigrationInterface, QueryRunner } from "typeorm";

export class AddBookingDateToTeacherBooking1762615873352 implements MigrationInterface {
    name = 'AddBookingDateToTeacherBooking1762615873352'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`teacher_bookings\` ADD \`bookingDate\` date NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`teacher_bookings\` DROP COLUMN \`bookingDate\``);
    }

}
