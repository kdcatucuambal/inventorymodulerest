import { Request, Response, NextFunction } from "express";
import * as jwt from "jsonwebtoken";
import config from "../config/config";


export const checkJwt = (req: Request, res: Response, next: NextFunction) => {

 
    const token = <string>req.headers['auth'];
    let jwtPayload: any;

    try {
        jwtPayload = <any>jwt.verify(token, config.jwtSecret);
        res.locals.jwtPayload = jwtPayload;
    } catch (error) {
        return res.status(401).json({
            message: "Not Auhtorized"
        });
    }

    const { userId, name } = jwtPayload;
    const newToken = jwt.sign({ userId, name }, config.jwtSecret, { expiresIn: '1h' });
    res.setHeader('token', newToken);

    //Call next
    next();
}