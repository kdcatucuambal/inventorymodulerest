import { Router } from 'express';
import { RoleController } from "./../controller/users/RoleController";

const router = Router();

router.get('/', RoleController.getAllRoles);
router.get('/:id', RoleController.getRoleById);
router.get('/byname/:name', RoleController.getRoleByName);
router.post('/', RoleController.createRole);
router.put('/:id', RoleController.updateRoleById)
router.delete('/:id', RoleController.removeRoleById)

export default router;