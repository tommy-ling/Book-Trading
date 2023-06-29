import express, { Request, Response } from 'express';
import validator from 'validator';
import { currentUser, requireAuth, ReqValError, BadReqError } from '@tlbooktrading/common';
import { User } from '../models/user';
import { Password } from '../resources/password';
import { UserUpdatedPublisher } from '../events/publisher/userUpdatedPublisher';
import { natsWrapper } from '../natsWrapper';

const router = express.Router();

router.put('/api/users/update', currentUser, requireAuth, async (req: Request, res: Response) => {
    const existingUser = await User.findOne({ email: req.currentUser!.email });
    if (!existingUser) {
        throw new BadReqError('User not found');
    }

    const { name, city, password } = req.body;
    const trimmedPW = validator.trim(password);

    if (validator.isEmpty(trimmedPW)) {
        throw new ReqValError('Password must not be empty!');
    }

    if (
        !validator.isStrongPassword(trimmedPW, {
            minLength: 6,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1,
        })
    ) {
        throw new ReqValError('Password must contain at least 6 chars, 1 uppercase, 1 number and 1 symbol!');
    }

    const passwordMatch = await Password.compare(existingUser!.password, trimmedPW);
    if (passwordMatch) {
        throw new BadReqError('Password cannot be the same');
    }

    if (validator.isEmpty(name)) {
        throw new ReqValError('Name must not be empty!');
    }

    if (validator.isEmpty(city)) {
        throw new ReqValError('City must not be empty!');
    }

    existingUser.set({
        name,
        city,
        password: trimmedPW,
    });

    await existingUser.save();

    new UserUpdatedPublisher(natsWrapper.client).publish({
        id: existingUser.id,
        email: existingUser.email,
        password: existingUser.password,
        name: existingUser.name,
        userName: existingUser.userName,
        city: existingUser.city,
        version: existingUser.version,
        bookId: existingUser.bookId,
    });

    res.send(existingUser);
});

export { router as updateRouter };
