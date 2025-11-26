import { Column, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

import { Entity } from "typeorm";
import { Teacher } from "./teacher.entity";
import Subject from "./subject.entity";
import ClassBooking from "./class-booking.entity";

@Entity('classes')
export default class ClassEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;
   
    @Column({ type: 'uuid' })
    teacherId: string;
    @ManyToOne(() => Teacher, (teacher) => teacher.id)
    @JoinColumn()
    teacher: Teacher;

    @Column({ type: 'uuid' })
    subjectId: string;
    @ManyToOne(() => Subject, (subject) => subject.id)
    @JoinColumn()
    subject: Subject;

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    price: number;


    @Column({type:'time'})
    startTime: string;

    @Column({type:'time'})
    endTime: string;


    @Column({ type: 'integer', default: 0 })
    duration: number;

    @Column({ type: 'integer', default: 0 })
    maxStudents: number;

    @Column({ type:'json', nullable: true })
    scheduleDays: string[] | null;
    

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;
    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updatedAt: Date;
    @Column({ default: false })
    isDeleted: boolean;

    @OneToMany(() => ClassBooking, (classBooking) => classBooking.classEntity)
    classBookings: ClassBooking[];

    getScheduleDays(): string[] {
        return this.scheduleDays ?? [];
    }
}