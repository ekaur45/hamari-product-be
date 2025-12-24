import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateSupportTicket1765000003000 implements MigrationInterface {
    name = 'CreateSupportTicket1765000003000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(new Table({
            name: 'support_tickets',
            columns: [
                { name: 'id', type: 'varchar', length: '36', isPrimary: true },
                { name: 'userId', type: 'varchar', length: '36', isNullable: false },
                { name: 'title', type: 'varchar', length: '200', isNullable: false },
                { name: 'description', type: 'text', isNullable: true },
                { name: 'status', type: 'enum', enum: ['open','in_progress','resolved','closed'], enumName: 'support_ticket_status_enum', default: `'open'` },
                { name: 'priority', type: 'enum', enum: ['low','medium','high'], enumName: 'support_ticket_priority_enum', default: `'medium'` },
                { name: 'assigneeId', type: 'varchar', length: '36', isNullable: true },
                { name: 'isDeleted', type: 'boolean', default: false },
                { name: 'createdAt', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
                { name: 'updatedAt', type: 'timestamp', default: 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' },
            ],
            foreignKeys: [
                { columnNames: ['userId'], referencedTableName: 'users', referencedColumnNames: ['id'], onDelete: 'CASCADE' },
                { columnNames: ['assigneeId'], referencedTableName: 'users', referencedColumnNames: ['id'], onDelete: 'SET NULL' },
            ],
            indices: [
                { columnNames: ['status'] },
                { columnNames: ['priority'] },
                { columnNames: ['userId'] },
                { columnNames: ['assigneeId'] },
            ],
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('support_tickets');
        await queryRunner.query(`DROP TYPE IF EXISTS "support_ticket_status_enum"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "support_ticket_priority_enum"`);
    }
}

