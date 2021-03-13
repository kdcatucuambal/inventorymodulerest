import { getRepository, Like, Between } from "typeorm";
import { json, Request, Response } from "express";
import { Product } from "../../entity/products/ProductModel";


import { validate } from "class-validator"
import { getStock, getStockImp, getDetailsByProduct } from "./../../util/api.util";
import { ItemSetting } from "../../entity/settings/ItemSettingModel";
import { fetchJson } from "fetch-json";
import { performance } from "perf_hooks";
import { URL_ALL } from "./../../util/apis.url";


export class ProductController {
    static getAllProducts = async (req: Request, res: Response) => {
        const productBD = getRepository(Product);
        const itemBD = getRepository(ItemSetting);
        const inventoryItems = await itemBD.find({ relations: ['setting', 'product'] });

        const shoppingItems = await fetchJson.get(URL_ALL.shopping);
        // const invoicesItems = await fetchJson.get(url2);
        //onst orderItems = await fetchJson.get(URL_ALL.orders);


        let products: Product[];
        try {
            products = await productBD.find({ order: { id: "DESC" } });
            for (const p of products) {
                p.stock = getStockImp(p.id, shoppingItems, [], [], inventoryItems);
            }
        } catch (error) {
            return res.status(404).json({
                message: 'Something goes wrong'
            })
        }
        if (products.length > 0) {
            res.send(products);
        } else {
            res.status(201).json(
                { message: 'There are no products yet' }
            );
        }
    }

    static getProductsByPage = async (req: Request, res: Response) => {
        const productBD = getRepository(Product);
        const { take, skip } = req.params;
        let products: Product[];
        const itemBD = getRepository(ItemSetting);
        const inventoryItems = await itemBD.find({ relations: ['setting', 'product'] });
        const shoppingItems = await fetchJson.get(URL_ALL.shopping);
        
        try {
            products = await productBD.find({
                order: { id: "DESC" },
                take: Number.parseInt(take),
                skip: Number.parseInt(skip)
            });
            for (const p of products) {
                p.stock = getStockImp(p.id, shoppingItems, [], [], inventoryItems);
            }

        } catch (error) {
            return res.status(404).json({
                message: 'Something goes wrong'
            })
        }

        if (products.length > 0) {
            res.send(products);
        } else {
            res.status(201).json(
                { message: 'There are no products yet' }
            );
        }

    }

    static getMovementsByProduct = async (req: Request, res: Response) => {
        const { code } = req.params;
        
        try {
            const detail = await getDetailsByProduct(code);      
            return res.send(detail);
        } catch (error) {
            res.status(404).json(
                { message: 'Something goes wrong', error }
            );
        }
       
    }


    static getProductById = async (req: Request, res: Response) => {
        const productBD = getRepository(Product);
        let product: Product;
        const { id } = req.params;
        try {
            product = await productBD.findOneOrFail(id);      
            product.stock = await getStock(id);
            res.send(product);
        } catch (error) {
            res.status(404).json(
                { message: 'There is no product', error }
            );
        }
    }
    static getProductByName = async (req: Request, res: Response) => {
        const productBD = getRepository(Product);
        let product: Product;
        const { name } = req.params;
        try {
            product = await productBD.createQueryBuilder().
                select("product").from(Product, "product").
                where("product.name = :name", { name }).getOneOrFail();
            product.stock = await getStock(product.id);
            res.send(product);
        } catch (error) {
            res.status(404).json(
                { message: 'There is no product' }
            );
        }


    }
    static createProduct = async (req: Request, res: Response) => {
        const { id, name, description, iva, price, cost, state, image } = req.body;

        const product = new Product();
        product.name = name;
        product.id = id;
        product.description = description;
        product.iva = iva;
        product.price = price;
        product.cost = cost;
        product.state = state;
        product.image = image;

        const validationOpt = { validationError: { target: false, value: false } }
        const errors = await validate(product, validationOpt);
        if (errors.length > 0) {
            return res.status(400).json(errors);
        }


        let response: any;
        const productBD = getRepository(Product);
        try {
            response = await productBD.save(product);
        } catch (error) {
            return res.status(409).json({
                message: 'Product incorrect'
            });
        }

        res.json({
            "message": "Product created",
            "response": response,
        })
    }
    static updateProductById = async (req: Request, res: Response) => {
        const { id } = req.params;
        const { name, description, iva, price, cost, state, image } = req.body;
        const productBD = getRepository(Product);
        let product: Product;

        try {
            product = await productBD.findOneOrFail(id);
            product.name = name;
            product.id = id;
            product.description = description;
            product.iva = iva;
            product.price = price;
            product.cost = cost;
            product.state = state;
            product.image = image;
        } catch (error) {
            return res.status(404).json(
                { message: 'Product not found!' }
            );
        }

        const validationOpt = { validationError: { target: false, value: false } }
        const errors = await validate(product, validationOpt);
        if (errors.length > 0) {
            return res.status(400).json(errors);
        }
        let response: any;
        try {
            response = await productBD.save(product);
        } catch (error) {
            return res.status(409).json(
                {
                    message: 'Productname already in use',
                    error
                }
            );
        }
        res.status(201).json({ message: 'Product updated', response });
    }
    static removeProductById = async (req: Request, res: Response) => {
        const { id } = req.params;
        const productBD = getRepository(Product);
        try {
            await productBD.findOneOrFail(id);
        } catch (error) {
            return res.status(404).json(
                { message: 'Product not found!' }
            );
        }

        const response = await productBD.delete(id);
        res.status(201).json(
            { message: 'Product deleted successfully', response }
        );
    }

    static getProductsCount = async (req: Request, res: Response) => {
        const productBD = getRepository(Product);
        const count = await productBD.count();
        return res.json({ count });
    }


    static getProductsByNameMatch = async (req: Request, res: Response) => {
        const { text } = req.params;

        const productBD = getRepository(Product);
        const itemBD = getRepository(ItemSetting);
        const inventoryItems = await itemBD.find({ relations: ['setting', 'product'] });

        const shoppingItems = await fetchJson.get(URL_ALL.shopping);
        let productsFound: Product[];
        try {
            productsFound = await productBD.find({ where: `"name" ILIKE '%${text}%'` });
            for (const p of productsFound) {
                p.stock = getStockImp(p.id, shoppingItems, [], [], inventoryItems);
            }
        } catch (error) {
            return res.status(404).json({
                message: 'Something goes wrong'
            })
        }

        if (productsFound.length === 0) {
            return res.status(404).json({
                message: 'No products found'
            });
        }

        res.send(productsFound);
    }

    static getProductByIdMatch = async (req: Request, res: Response) => {
        const { text } = req.params;

        const productBD = getRepository(Product);

        let productsFound: Product[];
        try {
            productsFound = await productBD.find({ where: `"id" ILIKE '%${text}%'` });

        } catch (error) {
            return res.status(404).json({
                message: 'Something goes wrong'
            })
        }

        if (productsFound.length === 0) {
            return res.status(404).json({
                message: 'No products found'
            });
        }

        res.send(productsFound);

    }
}