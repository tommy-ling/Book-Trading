import express, { Request, Response } from 'express';
import { currentUser, requireAuth } from '@tlbooktrading/common';
import { User } from '../models/user';

const router = express.Router();

router.get('/api/users/currentUser', currentUser, async (req: Request, res: Response) => {
    const existingUser = await User.findOne({ email: req.currentUser?.email });
    res.send({ currentUser: existingUser });
});

export { router as currentUserRouter };
