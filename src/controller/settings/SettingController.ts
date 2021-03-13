import { getRepository, CreateDateColumn } from "typeorm";
import { Request, Response } from "express";
import { Setting } from "../../entity/settings/SettingModel";
import { ItemSetting } from "./../../entity/settings/ItemSettingModel";
import { Product } from "./../../entity/products/ProductModel";
import { validate } from "class-validator"
import { getCodeGenerated } from "./../../util/api.util";

export class SettingController {

    static getAllSettings = async (req: Request, res: Response) => {
        const settingsBD = getRepository(Setting);

        let settings: Setting[];

        try {
            settings = await settingsBD.find({ relations: ['items', "items.product"] });

        } catch (error) {
            return res.status(404).json({
                message: 'Something goes wrong'
            })
        }

        if (settings.length > 0) {
            res.send(settings);
        } else {
            res.status(404).json(
                { message: 'There are no setting yet' }
            );
        }
    }

    static getSettingById = async (req: Request, res: Response) => {
        const settingBD = getRepository(Setting);
        let setting: Setting;
        const { id } = req.params;
        try {
            setting = await settingBD.findOneOrFail(id, { relations: ['items', "items.product"] });
            res.send(setting);
        } catch (error) {
            res.status(404).json(
                { message: 'There is no setting' }
            );
        }
    }

    static getSettingsByDates = async (req: Request, res: Response) => {
        const settingBD = getRepository(Setting);
        const { to, end } = req.params;
        const settings: Setting[] = await settingBD.find({ where: `"createdAt" BETWEEN '${to}' AND '${end}'`, relations: ['items', "items.product"] },);
        if (settings.length > 0) {
            res.send(settings);
        }
        res.json({ message: "There are no settings yet" })
    }

    static getItemsBySetting = async (req: Request, res: Response) => {
        const itemBD = getRepository(ItemSetting);
        const { id } = req.params;
        const r = await itemBD.find({ where: { setting: id }, relations: ['setting', 'product'] });
        res.send(r);
    }

    static getAllItems = async (req: Request, res: Response) => {
        const itemBD = getRepository(ItemSetting);
        const r = await itemBD.find({ relations: ['setting', 'product'] });
        res.send(r);

    }


    static removeSettingById = async (req: Request, res: Response) => {
        const { id } = req.params;
        const settingBD = getRepository(Setting);
        try {
            await settingBD.findOneOrFail(id);
        } catch (error) {
            return res.status(404).json(
                { message: 'Setting not found!' }
            );
        }
        const response = await settingBD.delete(id);
        res.status(201).json(
            { message: 'Setting deleted successfully', response }
        );
    }


    static createSetting = async (req: Request, res: Response) => {
        const settingsBD = getRepository(Setting);
        const productBD = getRepository(Product);
        const { reason, items } = req.body;
        const q = await settingsBD.count();
        const code = getCodeGenerated(q);
        const setting = new Setting();
        setting.reason = reason;
        setting.id = code;
        setting.createdAt = new Date();
        let itemsCreated: ItemSetting[] = [];
        for (const item of items) {
            const itemS = new ItemSetting();
            const product: Product = await productBD.findOne(item.id);
            itemS.product = product;
            itemS.observation = item.observation;
            itemS.quantity = item.quantity;
            itemsCreated.push(itemS);
        }
        setting.items = itemsCreated;
        const validationOpt = { validationError: { target: false, value: false } }
        const errors = await validate(setting, validationOpt);
        if (errors.length > 0) {
            return res.status(400).json(errors);
        }
        let response: any;
        try {
            response = await settingsBD.save(setting);
        } catch (error) {
            return res.status(409).json({
                message: 'Setting incorrect'
            });
        }
        res.json({
            "message": "Setting created",
            "response": response,
        })
    }


    static updateSettingById = async (req: Request, res: Response) => {
        const { id } = req.params;
        const { reason } = req.body;
        const settingBD = getRepository(Setting);
        let setting: Setting;
        try {
            setting = await settingBD.findOneOrFail(id);
            setting.reason = reason;
        } catch (error) {
            return res.status(404).json(
                { message: 'Setting not found!' }
            );
        }
        const validationOpt = { validationError: { target: false, value: false } }
        const errors = await validate(setting, validationOpt);
        if (errors.length > 0) {
            return res.status(400).json(errors);
        }
        let response: any;
        try {
            response = await settingBD.save(setting);
        } catch (error) {
            return res.status(409).json(
                {
                    message: 'Rolename already in use',
                    error
                }
            );
        }
        res.status(201).json({ message: 'Setting updated', response });
    }


}