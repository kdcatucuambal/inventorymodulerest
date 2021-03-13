import { getRepository } from "typeorm";
import { Request, Response } from 'express';
import { User } from "./../entity/users/UserModel";
import * as jwt from "jsonwebtoken";
import config from "./../config/config"
import { validate } from 'class-validator';

export class AuthController {
    static login = async (req: Request, res: Response) => {
        const { id, password } = req.body;

        if (!(id && password)) {
            res.status(400).json(
                { message: 'Username & Password are required!' }
            );
        }

        const userRepository = getRepository(User);
        let user: User;
        try {
            user = await userRepository.findOneOrFail(id, { relations: ["role"] });
        } catch (error) {
            return res.status(400).json(
                { message: 'Username or password incorrect!' }
            )
        }

        if (!user.checkPassword(password)) {
            return res.status(400).json(
                { message: 'Username & Password are incorrect!' }
            );
        }

        //Generate token this user
        const token = jwt.sign(
            {
                userId: user.id,
            }
            , config.jwtSecret, { expiresIn: '1h' });

        res.json({
            message: 'OK',
            token,
            id: user.id,
            name: user.name,
            lastname: user.lastname,
            role: user.role.name
        });
    }


    static changePassword = async (req: Request, res: Response) => {
        const { userId } = res.locals.jwtPayload;
        const { oldPassword, newPassword } = req.body;

        if (!(oldPassword && newPassword)) {
            res.status(400).json({
                message: 'Old password & new password are required'
            })
        }

        const userRepository = getRepository(User);
        let user: User;
        try {
            user = await userRepository.findOneOrFail(userId);
        } catch (error) {
            res.status(400).json({
                message: 'Something goes wrong'
            });
        }

        if (!user.checkPassword(oldPassword)) {
            return res.status(401).json({ message: 'Check your password' })
        }

        user.password = newPassword;

        const validationOpt = { validationError: { target: false, value: false } }
        const errors = await validate(user, validationOpt);

        if (errors.length > 0) {
            return res.status(400).json(errors);
        }

        //Hash password
        user.hashPassword();
        userRepository.save(user);

        res.json({ message: 'Password changed' });
    }
}