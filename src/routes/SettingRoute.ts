import { Router } from 'express';
import { checkJwt } from '../middlewares/jwt';
import { checkRole } from '../middlewares/role';
import { SettingController } from "./../controller/settings/SettingController";

const router = Router();

router.get('/', [checkJwt, checkRole(['ADMIN', 'BODE'])], SettingController.getAllSettings);

router.post('/', [checkJwt, checkRole(['ADMIN', 'BODE'])], SettingController.createSetting);

router.get('/bydates/:to/:end', [checkJwt, checkRole(['ADMIN', 'BODE'])], SettingController.getSettingsByDates);

router.get('/:id', [checkJwt, checkRole(['ADMIN', 'BODE'])], SettingController.getSettingById);

router.delete('/:id', [checkJwt, checkRole(['ADMIN', 'BODE'])], SettingController.removeSettingById);

router.put('/:id', [checkJwt, checkRole(['ADMIN', 'BODE'])], SettingController.updateSettingById);

router.get('/items/bysetting/:id', [checkJwt, checkRole(['ADMIN', 'BODE'])], SettingController.getItemsBySetting);

export default router;