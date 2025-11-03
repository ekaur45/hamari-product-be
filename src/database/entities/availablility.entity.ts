import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Teacher } from "./teacher.entity";
import TeacherBooking from "./teacher-booking.entity";

export enum AvailabilityDay {
  Monday = 'Monday',
  Tuesday = 'Tuesday',
  Wednesday = 'Wednesday',
  Thursday = 'Thursday',
  Friday = 'Friday',
  Saturday = 'Saturday',
  Sunday = 'Sunday',
}
@Entity('availablility')
export default class Availability {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    teacherId: string;

    @ManyToOne(() => Teacher, (teacher) => teacher.id)
    @JoinColumn()
    teacher: Teacher;

    @Column({ type: 'enum', enum: AvailabilityDay })
    dayOfWeek: AvailabilityDay;

    @Column({ type: 'time' })
    startTime: string;

    @Column({ type: 'time' })
    endTime: string;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updatedAt: Date;
    
    @Column({ default: false })
    isDeleted: boolean;

    @OneToMany(() => TeacherBooking, (teacherBooking) => teacherBooking.availability)
    teacherBookings: TeacherBooking[];
}