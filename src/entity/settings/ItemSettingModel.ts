
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToOne, JoinColumn, JoinTable } from "typeorm";
import { Product } from "../products/ProductModel";
import { Setting } from "./SettingModel";

@Entity()
export class ItemSetting {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Setting, setting => setting.items, { nullable: false, onDelete: "CASCADE", onUpdate: "CASCADE" })
    setting: Setting;

    @ManyToOne(() => Product, product => product.items, { nullable: false })
    product: Product;

    @Column({ length: 255 })
    observation: string;

    @Column()
    quantity: number;

}