import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import UserDetail from "./user-details.entity";
@Entity('nationalities')
export default class Nationality {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ length: 255 })
    name: string;

    @Column({ length: 255 })
    code: string;

    @OneToMany(() => UserDetail, (userDetail) => userDetail.nationality)
    userDetails: UserDetail[];
}