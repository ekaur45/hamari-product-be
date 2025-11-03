import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('courses')
export default class Course {
    @PrimaryGeneratedColumn('uuid')
    id: string;
    @Column({ type: 'varchar', length: 255 })
    name: string;
    @Column({ type: 'text' })
    description: string;
    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;
    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updatedAt: Date;
    @Column({ default: false })
    isDeleted: boolean;
}