import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  JoinColumn,
} from 'typeorm';
import { Parent } from './parent.entity';
import { Student } from './student.entity';

@Entity('parent_children')
@Unique(['parentId', 'childId'])
export default class ParentChild {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  parentId: string;

  @ManyToOne(() => Parent, (parent) => parent.children)
  @JoinColumn()
  parent: Parent;

  @Column({ type: 'uuid' })
  childId: string;

  @ManyToOne(() => Student, (student) => student.id)
  @JoinColumn()
  child: Student;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;
  @Column({ default: false })
  isDeleted: boolean;
}
