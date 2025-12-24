import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateRefund1765000005000 implements MigrationInterface {
    name = 'CreateRefund1765000005000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(new Table({
            name: 'refunds',
            columns: [
                { name: 'id', type: 'varchar', length: '36', isPrimary: true },
                { name: 'classBookingId', type: 'varchar', length: '36', isNullable: true },
                { name: 'teacherBookingId', type: 'varchar', length: '36', isNullable: true },
                { name: 'userId', type: 'varchar', length: '36', isNullable: false },
                { name: 'amount', type: 'decimal', precision: 10, scale: 2, isNullable: false },
                { name: 'status', type: 'enum', enum: ['requested','approved','rejected','processed'], enumName: 'refund_status_enum', default: `'requested'` },
                { name: 'reason', type: 'text', isNullable: true },
                { name: 'isDeleted', type: 'boolean', default: false },
                { name: 'createdAt', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
                { name: 'updatedAt', type: 'timestamp', default: 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' },
            ],
            foreignKeys: [
                { columnNames: ['classBookingId'], referencedTableName: 'class_bookings', referencedColumnNames: ['id'], onDelete: 'SET NULL' },
                { columnNames: ['teacherBookingId'], referencedTableName: 'teacher_bookings', referencedColumnNames: ['id'], onDelete: 'SET NULL' },
                { columnNames: ['userId'], referencedTableName: 'users', referencedColumnNames: ['id'], onDelete: 'CASCADE' },
            ],
            indices: [
                { columnNames: ['status'] },
                { columnNames: ['userId'] },
            ],
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('refunds');
        await queryRunner.query(`DROP TYPE IF EXISTS "refund_status_enum"`);
    }
}

