import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import validator from 'validator';
import { ReqValError, BadReqError } from '@tlbooktrading/common';

import { User } from '../models/user';
import { UserCreatedPublisher } from '../events/publisher/userCreatedPublisher';
import { natsWrapper } from '../natsWrapper';

const router = express.Router();

router.post('/api/users/signup', async (req: Request, res: Response) => {
    const { email, password, name, city, userName } = req.body;
    const trimmedPW = validator.trim(password);

    if (!validator.isEmail(email)) {
        throw new ReqValError('Must provide a valid email');
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
    if (validator.isEmpty(name)) {
        throw new ReqValError('Name must not be empty!');
    }
    if (validator.isEmpty(city)) {
        throw new ReqValError('City must not be empty!');
    }
    if (validator.isEmpty(userName)) {
        throw new ReqValError('Username must not be empty!');
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new BadReqError('Email already in use');
    }

    const existingUserName = await User.findOne({ userName });
    if (existingUserName) {
        throw new BadReqError('Username already in use');
    }

    const user = User.build({ email, password: trimmedPW, name, city, userName });
    await user.save();

    const userJwt = jwt.sign(
        {
            id: user.id,
            email: user.email,
        },
        process.env.JWT_KEY!
    );

    req.session = {
        jwt: userJwt,
    };

    new UserCreatedPublisher(natsWrapper.client).publish({
        id: user.id,
        email: user.email,
        name: user.name,
        userName: user.userName,
        city: user.city,
        version: user.version,
        password: user.password,
    });

    res.status(201).send(user);
});

export { router as signupRouter };
