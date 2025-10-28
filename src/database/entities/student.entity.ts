import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('students')
export class Student {
  @PrimaryGeneratedColumn('uuid')
  id: number;

  @Column({ type: 'uuid' })
  userId: string;

  @Column()
  name: string;

  @Column()
  dateOfBirth: number;

  @Column()
  email: string;

  @Column()
  enrolled: boolean;
}
