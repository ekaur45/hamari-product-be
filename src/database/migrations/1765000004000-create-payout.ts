import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreatePayout1765000004000 implements MigrationInterface {
    name = 'CreatePayout1765000004000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(new Table({
            name: 'payouts',
            columns: [
                { name: 'id', type: 'varchar', length: '36', isPrimary: true },
                { name: 'teacherId', type: 'varchar', length: '36', isNullable: false },
                { name: 'amount', type: 'decimal', precision: 10, scale: 2, isNullable: false },
                { name: 'currency', type: 'varchar', length: '50', isNullable: true },
                { name: 'status', type: 'enum', enum: ['pending','processing','paid','failed','cancelled'], enumName: 'payout_status_enum', default: `'pending'` },
                { name: 'processedAt', type: 'timestamp', isNullable: true },
                { name: 'failureReason', type: 'varchar', length: '255', isNullable: true },
                { name: 'isDeleted', type: 'boolean', default: false },
                { name: 'createdAt', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
                { name: 'updatedAt', type: 'timestamp', default: 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' },
            ],
            foreignKeys: [
                { columnNames: ['teacherId'], referencedTableName: 'teachers', referencedColumnNames: ['id'], onDelete: 'CASCADE' },
            ],
            indices: [
                { columnNames: ['teacherId'] },
                { columnNames: ['status'] },
            ],
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('payouts');
        await queryRunner.query(`DROP TYPE IF EXISTS "payout_status_enum"`);
    }
}

