import { Entity, PrimaryColumn, Column, Unique, OneToMany } from "typeorm";
import { IsNotEmpty, MinLength, MaxLength, IsNotEmptyObject, IsEmail, Length } from "class-validator";
import { ItemSetting } from "../settings/ItemSettingModel";

@Entity()
@Unique(['name'])
export class Product {

    @PrimaryColumn()
    @Length(8, 8)
    id: string;

    @Column()
    @MaxLength(50)
    @IsNotEmpty()
    name: string;

    @Column()
    @MaxLength(255)
    @IsNotEmpty()
    description: string;

    @Column()
    @IsNotEmpty()
    iva: boolean;

    @Column("decimal", { precision: 6, scale: 2 })
    @IsNotEmpty()
    cost: number;

    @Column("decimal", { precision: 6, scale: 2 })
    @IsNotEmpty()
    price: number;

    @Column()
    @IsNotEmpty()
    state: boolean;

    @Column({ nullable: true })
    image: string;

    @OneToMany(() => ItemSetting, itemSetting => itemSetting.setting)
    items: ItemSetting[];
    
    stock: number;

}