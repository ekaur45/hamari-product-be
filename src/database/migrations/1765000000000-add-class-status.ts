import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddClassStatus1765000000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn('classes', new TableColumn({
            name: 'status',
            type: 'enum',
            enum: ['scheduled', 'ongoing', 'completed', 'cancelled'],
            enumName: 'classes_status_enum',
            default: `'scheduled'`,
            isNullable: false,
        }));

        await queryRunner.addColumn('classes', new TableColumn({
            name: 'cancelReason',
            type: 'varchar',
            length: '255',
            isNullable: true,
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('classes', 'cancelReason');
        await queryRunner.dropColumn('classes', 'status');
        await queryRunner.query(`DROP TYPE "classes_status_enum"`);
    }
}

