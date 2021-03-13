import { Router } from 'express';
import { UserController } from "./../controller/users/UserController";
import { checkJwt } from "./../middlewares/jwt";
import { checkRole } from "./../middlewares/role";

const router = Router();

router.get('/', [checkJwt, checkRole(['ADMIN'])], UserController.getAllUsers);
router.get('/:id', [checkJwt, checkRole(['ADMIN'])], UserController.getUserById);
router.get('/byrole/:name', [checkJwt, checkRole(['ADMIN'])], UserController.getUserByRole);
router.post('/', [checkJwt, checkRole(['ADMIN'])], UserController.createUser);
router.patch('/update-password/:id', [checkJwt, checkRole(['ADMIN'])], UserController.updatePassword);
router.put('/:id', [checkJwt, checkRole(['ADMIN'])], UserController.updateUserById)
router.delete('/:id', [checkJwt, checkRole(['ADMIN'])], UserController.removeUserById)


export default router;