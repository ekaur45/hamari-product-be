import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
@Entity('nationalities')
export default class Nationality {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ length: 255 })
    name: string;

    @Column({ length: 255 })
    code: string;
}