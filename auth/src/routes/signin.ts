import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import validator from 'validator';
import { ReqValError, BadReqError } from '@tlbooktrading/common';

import { Password } from '../resources/password';
import { User } from '../models/user';

const router = express.Router();

router.post('/api/users/signin', async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const trimmedPW = validator.trim(password);

    if (!validator.isEmail(email)) {
        throw new ReqValError('Must provide a valid email');
    }
    if (validator.isEmpty(trimmedPW)) {
        throw new ReqValError('Password must not be empty!');
    }

    const existingUser = await User.findOne({ email });
    if (!existingUser) {
        throw new BadReqError('Login request failed');
    }

    const passwordMatch = await Password.compare(existingUser.password, trimmedPW);
    if (!passwordMatch) {
        throw new BadReqError(`Login request failed`);
    }

    const userJwt = jwt.sign(
        {
            id: existingUser.id,
            email: existingUser.email,
        },
        process.env.JWT_KEY!
    );

    req.session = {
        jwt: userJwt,
    };

    res.status(200).send(existingUser);
});

export { router as signinRouter };
