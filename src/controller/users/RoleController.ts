import { getRepository } from "typeorm";
import { Request, Response } from "express";
import { User } from "./../../entity/users/UserModel";
import { Role } from "./../../entity/users/RoleModel";
import { validate } from "class-validator"

export class RoleController {

    static getAllRoles = async (req: Request, res: Response) => {
        const roleBD = getRepository(Role);
        let roles: Role[];

        try {
            roles = await roleBD.find();
        } catch (error) {
            return res.status(404).json({
                message: 'Something goes wrong'
            })
        }

        if (roles.length > 0) {
            res.send(roles);
        } else {
            res.status(404).json(
                { message: 'There are no roles yet' }
            );
        }
    }
    static getRoleById = async (req: Request, res: Response) => {
        const roleBD = getRepository(Role);
        let role: Role;
        const { id } = req.params;
        try {
            role = await roleBD.findOneOrFail(id);
            res.send(role);
        } catch (error) {
            res.status(404).json(
                { message: 'There is no role' }
            );
        }

    }
    static getRoleByName = async (req: Request, res: Response) => {
        const roleBD = getRepository(Role);
        let role: Role;
        const { name } = req.params;
        try {
            role = await roleBD.createQueryBuilder().
                select("role").from(Role, "role").
                where("role.name = :name", { name }).getOneOrFail();
            res.send(role);
        } catch (error) {
            res.status(404).json(
                { message: 'There is no role' }
            );
        }


    }
    static createRole = async (req: Request, res: Response) => {
        const { name } = req.body;

        const role = new Role();
        role.name = name;
        
        const validationOpt = { validationError: { target: false, value: false } }
        const errors = await validate(role, validationOpt);
        if (errors.length > 0) {
            return res.status(400).json(errors);
        }


        let response: any;
        const roleBD = getRepository(Role);
        try {
            response = await roleBD.save(role);
        } catch (error) {
            return res.status(409).json({
                message: 'Role incorrect'
            });
        }

        res.json({
            "message": "Role created",
            "response": response,
        })
    }
    static updateRoleById = async (req: Request, res: Response) => {
        const { id } = req.params;
        const { name } = req.body;
        const roleBD = getRepository(Role);
        let role: Role;

        try {
            role = await roleBD.findOneOrFail(id);
            role.name = name;
        } catch (error) {
            return res.status(404).json(
                { message: 'Role not found!' }
            );
        }

        const validationOpt = { validationError: { target: false, value: false } }
        const errors = await validate(role, validationOpt);
        if (errors.length > 0) {
            return res.status(400).json(errors);
        }
        let response: any;
        try {
            response = await roleBD.save(role);
        } catch (error) {
            return res.status(409).json(
                {
                    message: 'Rolename already in use',
                    error
                }
            );
        }
        res.status(201).json({ message: 'Role updated', response });
    }
    static removeRoleById = async (req: Request, res: Response) => {
        const { id } = req.params;
        const roleBD = getRepository(Role);
        try {
            await roleBD.findOneOrFail(id);
        } catch (error) {
            return res.status(404).json(
                { message: 'Role not found!' }
            );
        }

        const response = await roleBD.delete(id);
        res.status(201).json(
            { message: 'Role deleted successfully', response }
        );
    }

}
