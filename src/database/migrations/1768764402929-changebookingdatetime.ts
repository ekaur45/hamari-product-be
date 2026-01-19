import { MigrationInterface, QueryRunner } from "typeorm";

export class Changebookingdatetime1768764402929 implements MigrationInterface {
    name = 'Changebookingdatetime1768764402929'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`teacher_bookings\` DROP COLUMN \`bookingDate\``);
        await queryRunner.query(`ALTER TABLE \`teacher_bookings\` ADD \`bookingDate\` datetime NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`teacher_bookings\` DROP COLUMN \`bookingDate\``);
        await queryRunner.query(`ALTER TABLE \`teacher_bookings\` ADD \`bookingDate\` date NOT NULL`);
    }

}
