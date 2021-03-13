import { Router } from 'express';
import { ProductController } from "./../controller/products/ProductController";

import { checkJwt } from "./../middlewares/jwt";
import { checkRole } from "./../middlewares/role";

const router = Router();

router.get('/', ProductController.getAllProducts);
router.get('/:id', ProductController.getProductById);
router.get('/byname/:name', ProductController.getProductByName);
router.get('/like/:text', ProductController.getProductsByNameMatch);
router.get('/likeid/:text', ProductController.getProductByIdMatch);
router.get('/little/:take/:skip', ProductController.getProductsByPage);
router.get('/count/all', ProductController.getProductsCount);
router.get('/movements/:code', ProductController.getMovementsByProduct);
//Protected routes
router.post('/', [checkJwt, checkRole(['ADMIN', 'BODE'])], ProductController.createProduct);
router.put('/:id', [checkJwt, checkRole(['ADMIN', 'BODE'])], ProductController.updateProductById);
router.delete('/:id', [checkJwt, checkRole(['ADMIN', 'BODE'])], ProductController.removeProductById);


export default router;