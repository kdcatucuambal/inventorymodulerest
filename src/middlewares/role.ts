import { Request, Response, NextFunction } from "express";
import { getRepository } from "typeorm";
import { User } from "./../entity/users/UserModel";

export const checkRole = (roles: Array<String>) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        const { userId } = res.locals.jwtPayload;
        const userRepository = getRepository(User);
        let user: User;

        try {
            user = await userRepository.findOneOrFail(userId, { relations: ["role"] });
        } catch (e) {
            return res.status(401).json({ message: 'There are no messages' })
        }

        const { name } = user.role;
        if (roles.includes(name)) {
            next();
        } else {
            res.status(401).json({ message: 'Not Authorized' })
        }
    }
}