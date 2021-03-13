import { Entity, PrimaryGeneratedColumn, OneToMany, Column, Unique } from "typeorm";

import { IsNotEmpty, MinLength, MaxLength, IsNotEmptyObject } from "class-validator";

import { User } from "./UserModel";

@Entity()
@Unique(['name'])
export class Role {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    @MinLength(3)
    @MaxLength(10)
    @IsNotEmpty()
    name: string;

    @OneToMany(() => User, user => user.role, { cascade: true })
    users: User[];
}