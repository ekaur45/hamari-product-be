import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import User from "./user.entity";
import { OtpType } from "src/modules/shared/enums";

@Entity('otps')
export default class Otp {
    @PrimaryGeneratedColumn('uuid')
    id: string;
    @Column({ type: 'uuid' })
    userId: string;
    @ManyToOne(() => User, (user) => user.id)
    @JoinColumn({ name: 'userId' })
    user: User;
    @Column({ type: 'varchar', length: 255 })
    otp: string;
    @Column({ type: 'enum', enum: OtpType })
    type: OtpType;
    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;
    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updatedAt: Date;
    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP + INTERVAL 10 MINUTES' })
    expiresAt: Date;
    @Column({ type: 'boolean', default: false })
    isUsed: boolean;
    @Column({ type: 'boolean', default: false })
    isDeleted: boolean;
}