import { Router } from 'express';
import role from "./RoleRoute";
import user from "./UserRoute";
import product from "./ProductRoute";
import auth from "./AuthRoute";
import setting from "./SettingRoute";


const routes = Router();
routes.use('/roles', role);
routes.use('/users', user);
routes.use('/products', product);
routes.use('/auth', auth);
routes.use('/settings', setting)




routes.use("/", (req, res) => {
    res.send(`
        <h3>WELCOME API REST INVENTORY</h3>
    `);
});
export default routes;