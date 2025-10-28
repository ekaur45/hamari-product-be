import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('teachers')
export class Teacher {
  @PrimaryGeneratedColumn('uuid')
  id: number;

  @Column({ type: 'uuid' })
  userId: string;

  @Column()
  name: string;

  @Column()
  subject: string;

  @Column()
  email: string;

  @Column({ default: true })
  isActive: boolean;
}
