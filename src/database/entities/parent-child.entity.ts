import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
} from 'typeorm';
import User from './user.entity';
import {
  RelationshipType,
  RelationshipStatus,
} from '../../modules/shared/enums';

@Entity('parent_children')
@Unique(['parentId', 'childId'])
export default class ParentChild {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  parentId: string;

  @ManyToOne(() => User, (user) => user.children)
  parent: User;

  @Column({ type: 'uuid' })
  childId: string;

  @ManyToOne(() => User, (user) => user.parents)
  child: User;

  @Column({
    type: 'enum',
    enum: RelationshipType,
  })
  relationshipType: RelationshipType;

  @Column({
    type: 'enum',
    enum: RelationshipStatus,
    default: RelationshipStatus.ACTIVE,
  })
  status: RelationshipStatus;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ default: false })
  isDeleted: boolean;
}
