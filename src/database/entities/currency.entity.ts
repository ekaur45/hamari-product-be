import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn, CreateDateColumn } from 'typeorm';
import { CurrencyStatus } from 'src/modules/shared/enums';
@Entity('currencies')
export default class Currency {
    @PrimaryGeneratedColumn('uuid')
    id: string;
    @Column({ length: 255 })
    code: string;
    @Column({ length: 255 })
    name: string;
    @Column({ length: 255 })
    symbol: string;
    @Column({ type: 'decimal', precision: 10, scale: 2,transformer:{
        to: (value: number) => value,
        from: (value: string) => parseFloat(value),
    } })
    exchangeRate: number;
    @Column({ default: false })
    isBase: boolean;
    @Column({ type: 'enum', enum: CurrencyStatus, default: CurrencyStatus.ACTIVE })
    status: CurrencyStatus;
    @Column({ default: false })
    isDeleted: boolean;
    @CreateDateColumn()
    createdAt: Date;
    @UpdateDateColumn()
    updatedAt: Date;
}