import { Detail } from "./detail.model";
// import * as axios from "axios";
import { fetchJson } from 'fetch-json';
import { URL } from "./apis.url";
import { ItemSetting } from "../entity/settings/ItemSettingModel";
import { getRepository } from "typeorm";



function getCodeGenerated(quantity: number): string {
    const index: string = (quantity + 1).toString();
    let codeGenerated: string = 'AJUS-';
    for (let i = 0; i < (4 - index.length); i++) {
        codeGenerated += '0';
    }
    codeGenerated += index;
    return codeGenerated;
}


function getStockImp(idProduct: string, shopping: any[], invoices: any[], orders: any[], settings: any[]): number {
    let stock = 0;
    if (settings.length > 0) {
        for (const s of settings) {
            if (idProduct == s.product.id) {
                stock = stock + s.quantity;
            }
        }
    }

    if (shopping.length > 0) {
        for (const shop of shopping) {
            if (idProduct == shop.prod_id) {
                stock = stock + shop.detfac_cantidad;
            }
        }
    }

    if (invoices.length > 0) {

    }

    if (orders.length > 0) {
        for (const order of orders) {
            if (idProduct == order.prod_id) {
                stock = stock + (order.codproducto * -1);
            }
        }
    }
    return stock;
}


function getProductDetails(shopping: any[], invoices: any[], orders: any[], settings: any[]): Detail[] {
    const detail: Detail[] = [];

    if (settings.length > 0) {
        for (const s of settings) {
            detail.push({
                code: s.setting.id,
                date: s.setting.createdAt,
                type: "Documento de Ajuste",
                quantity: s.quantity
            })
        }
    }

    if (shopping.length > 0) {
        for (const shop of shopping) {
            detail.push({
                code: shop.fac_nro,
                date: shop.fac_fecha,
                type: shop.tipo_documento,
                quantity: shop.detfac_cantidad
            })
        }
    }

    if (invoices.length > 0) {

    }

    if (orders.length > 0) {
        for (const order of orders) {
            detail.push({
                code: order.idpedido,
                date: order.fechapedido,
                type: "Factura de Pedido",
                quantity: order.cantidad * -1
            })
        }
    }



    detail.sort(sortByDates)

    return detail;
}


function resolveStock(details: Detail[]): number {
    let stock = 0;

    for (const detail of details) {
        stock = stock + detail.quantity;
    }
    return stock;
}

function sortByDates(a: Detail, b: Detail) {
    return new Date(a.date).getTime() - new Date(b.date).getTime();
}

async function getStock(idProduct: string) {
    const itemBD = getRepository(ItemSetting);
    const partialShopping = await fetchJson.get(`${URL.shopping}/${idProduct}`);

    
    
    const partialSettings = await itemBD.find({ where: { product: idProduct }, relations: ['setting', 'product'] });
    const details = getProductDetails(partialShopping, [], [], partialSettings);
    return resolveStock(details);
}

async function getDetailsByProduct(idProduct: string) {
    const itemBD = getRepository(ItemSetting);
    const partialShopping = await fetchJson.get(`${URL.shopping}/${idProduct}`);
    const partialSettings = await itemBD.find({ where: { product: idProduct }, relations: ['setting', 'product'] });

    const details = getMovByProduct(partialShopping, [], [], partialSettings);
    return details;
}
function getMovByProduct(shopping: any[], invoices: any[], orders: any[], settings: any[]): Detail[] {
    const detail: Detail[] = [];
    if (settings.length > 0) {
        for (const s of settings) {
            detail.push({
                code: s.setting.id,
                date: s.setting.createdAt,
                type: "Documento de Ajuste",
                quantity: s.quantity,
                stock: 0
            })
        }
    }

    if (shopping.length > 0) {
        for (const shop of shopping) {
            detail.push({
                code: shop.fac_nro,
                date: shop.fac_fecha,
                type: shop.tipo_documento,
                quantity: shop.detfac_cantidad,
                stock: 0
            })
        }
    }

    if (invoices.length > 0) {
    }
    if (orders.length > 0) {
        for (const order of orders) {
            detail.push({
                code: order.idpedido,
                date: order.fechapedido,
                type: "Factura de Pedido",
                quantity: order.cantidad * -1,
                stock: 0
            })
        }
    }


    if (detail.length > 0) {
        detail.sort(sortByDates);
        detail[0].stock = detail[0].quantity;
        for (let i = 1; i < detail.length; i++) {
            const element = detail[i];
            element.stock = detail[i - 1].stock + element.quantity;
        }
    }
    return detail;
}

export { getCodeGenerated, getProductDetails, getStock, getStockImp,  getDetailsByProduct }