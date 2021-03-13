
import { Entity, PrimaryColumn, Column, CreateDateColumn, OneToMany } from "typeorm";
import { ItemSetting } from "./ItemSettingModel";

@Entity()
export class Setting {

    @PrimaryColumn()
    id: string;

    @Column({ default: 'Empty', length: 255 })
    reason: string;

    @Column()
    createdAt: Date;

    @OneToMany(() => ItemSetting, itemSetting => itemSetting.setting, { cascade: true })
    items: ItemSetting[]
}