import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateReview1765000002000 implements MigrationInterface {
    name = 'CreateReview1765000002000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(new Table({
            name: 'reviews',
            columns: [
                { name: 'id', type: 'varchar', length: '36', isPrimary: true },
                { name: 'reviewerId', type: 'varchar', length: '36', isNullable: false },
                { name: 'revieweeId', type: 'varchar', length: '36', isNullable: false },
                { name: 'reviewerRole', type: 'enum', enum: ['Admin','Teacher','Parent','Student','Academy Owner','Other'], enumName: 'reviews_reviewerRole_enum' },
                { name: 'revieweeRole', type: 'enum', enum: ['Admin','Teacher','Parent','Student','Academy Owner','Other'], enumName: 'reviews_revieweeRole_enum' },
                { name: 'rating', type: 'int', isNullable: false },
                { name: 'comment', type: 'text', isNullable: true },
                { name: 'isVisible', type: 'boolean', default: true },
                { name: 'isDeleted', type: 'boolean', default: false },
                { name: 'createdAt', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
                { name: 'updatedAt', type: 'timestamp', default: 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' },
            ],
            foreignKeys: [
                {
                    columnNames: ['reviewerId'],
                    referencedTableName: 'users',
                    referencedColumnNames: ['id'],
                    onDelete: 'CASCADE',
                },
                {
                    columnNames: ['revieweeId'],
                    referencedTableName: 'users',
                    referencedColumnNames: ['id'],
                    onDelete: 'CASCADE',
                },
            ],
            indices: [
                { columnNames: ['reviewerId'] },
                { columnNames: ['revieweeId'] },
                { columnNames: ['reviewerRole'] },
                { columnNames: ['revieweeRole'] },
            ],
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('reviews');
        await queryRunner.query(`DROP TYPE IF EXISTS "reviews_reviewerRole_enum"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "reviews_revieweeRole_enum"`);
    }
}

