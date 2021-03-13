import { Entity, PrimaryColumn, Column, ManyToOne } from "typeorm";
import { IsNotEmpty, MinLength, MaxLength, IsNotEmptyObject, IsEmail } from "class-validator";
import { genSaltSync, hashSync, compareSync } from "bcryptjs";


import { Role } from "./RoleModel";

@Entity()
export class User {
    @PrimaryColumn()
    id: string;

    @ManyToOne(() => Role, role => role.users)
    @IsNotEmptyObject()
    role: Role;

    @Column()
    @MinLength(2)
    @MaxLength(30)
    @IsNotEmpty()
    name: string;

    @Column()
    @MinLength(2)
    @MaxLength(30)
    @IsNotEmpty()
    lastname: string;

    @Column()
    @MinLength(8)
    @IsNotEmpty()
    password: string;

    @Column()
    birthdate: Date;

    @Column()
    @MaxLength(20)
    @IsNotEmpty()
    address: string;

    @Column()
    @MinLength(6)
    @MaxLength(10)
    phone: string;

    @Column()
    @MinLength(6)
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @Column()
    @IsNotEmpty()
    state: boolean;

    hashPassword(): void {
        const salt = genSaltSync(10);
        this.password = hashSync(this.password, salt);
    }

    checkPassword(password: string): boolean {
        return compareSync(password, this.password);
    }

}