import { getRepository } from "typeorm";
import { Request, Response } from "express";
import { User } from "./../../entity/users/UserModel";
import { Role } from "./../../entity/users/RoleModel";
import { validate } from "class-validator"

export class UserController {

    static getAllUsers = async (req: Request, res: Response) => {
        const userBD = getRepository(User);
        let users: User[];
        try {
            users = await userBD.find({ relations: ["role"] });
        } catch (error) {
            return res.status(404).json({
                message: 'Something goes wrong'
            })
        }

        if (users.length > 0) {
            res.send(users);
        } else {
            res.status(404).json(
                { message: 'There are no users yet' }
            );
        }
    }

    static getUserById = async (req: Request, res: Response) => {

        const userBD = getRepository(User);
        let user: User;
        const { id } = req.params;
        try {
            user = await userBD.findOneOrFail(id, { relations: ["role"] });
            res.send(user);
        } catch (error) {
            res.status(404).json(
                { message: 'There is no user' }
            );
        }


    }

    static getUserByRole = async (req: Request, res: Response) => {

        const userBD = getRepository(User);
        const roleBD = getRepository(Role);
        let user: User[];
        const { name } = req.params;
        const role = await roleBD.createQueryBuilder().
            select("role").from(Role, "role").
            where("role.name = :name", { name }).getOneOrFail();
        try {
            user = await userBD.find({ where: { role: role } });
            res.send(user);
        } catch (error) {
            res.status(404).json(
                { message: 'There is no user' }
            );
        }
    }

    static createUser = async (req: Request, res: Response) => {
        const { id, name, lastname, password, address, phone, email, state, role, birthdate } = req.body;
        const userBD = getRepository(User);

        const roleBD = getRepository(Role);


        let roleFound: Role;
        try {
            roleFound = await roleBD.findOneOrFail(role);
        } catch (error) {
            return res.status(409).json({
                message: 'Role Not Found',
                error
            });
        }

        const user = new User();
        user.name = name;
        user.lastname = lastname;
        user.password = password;
        user.phone = phone;
        user.email = email;
        user.state = state;
        user.address = address;
        user.birthdate = new Date(birthdate);
        user.role = roleFound;
        user.id = id;

        const validationOpt = { validationError: { target: false, value: false } }
        const errors = await validate(user, validationOpt);
        if (errors.length > 0) {
            return res.status(400).json(errors);
        }

        let response: any;
        try {
            user.hashPassword();
            response = await userBD.save(user);
        } catch (error) {
            return res.status(409).json({
                message: 'User incorrect',
                error
            });
        }

        res.json({
            "message": "User created",
            "response": response,
        })


    }


    static updatePassword = async (req: Request, res: Response) => {
        const { id } = req.params;
        const { password } = req.body;
        const userBD = getRepository(User);
        let user: User;
        try {
            user = await userBD.findOneOrFail(id, { relations: ["role"] });
            user.password = password;
        } catch (error) {
            return res.status(409).json({
                message: 'User Not Found',
                error
            });
        }

        const validationOpt = { validationError: { target: false, value: false } }
        const errors = await validate(user, validationOpt);
        if (errors.length > 0) {
            return res.status(400).json(errors);
        }

        let response: any;
        try {
            user.hashPassword();
            response = await userBD.save(user);
        } catch (error) {
            return res.status(409).json({
                message: 'User incorrect',
                error
            });
        }

        res.json({
            "message": "User updated",
            "response": response,
        })
    }

    static updateUserById = async (req: Request, res: Response) => {
        const { id } = req.params;
        const { name, lastname, address, phone, email, state, role, birthdate } = req.body;
        const userBD = getRepository(User);
        const roleBD = getRepository(Role);
        let user: User;
        let roleFound: Role;
        try {
            roleFound = await roleBD.findOneOrFail(role);
        } catch (error) {
            return res.status(409).json({
                message: 'Role Not Found',
                error
            });
        }


        try {
            user = await userBD.findOneOrFail(id);
            user.name = name;
            user.lastname = lastname;
            user.phone = phone;
            user.email = email;
            user.state = state;
            user.address = address;
            user.birthdate = new Date(birthdate);
            user.role = roleFound;

        } catch (error) {
            return res.status(404).json(
                { message: 'User not found!' }
            );
        }

        const validationOpt = { validationError: { target: false, value: false } }
        const errors = await validate(user, validationOpt);
        if (errors.length > 0) {
            return res.status(400).json(errors);
        }
        let response: any;
        try {
            response = await userBD.save(user);
        } catch (error) {
            return res.status(409).json(
                {
                    message: 'Something goes wrong',
                    error
                }
            );
        }
        res.status(201).json({ message: 'User updated', response });

    }

    static removeUserById = async (req: Request, res: Response) => {
        const { id } = req.params;
        const userBD = getRepository(User);
        try {
            await userBD.findOneOrFail(id);
        } catch (error) {
            return res.status(404).json(
                { message: 'User not found!' }
            );
        }

        const response = await userBD.delete(id);
        res.status(201).json(
            { message: 'User deleted successfully', response }
        );
    }


}