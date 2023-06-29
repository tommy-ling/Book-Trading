import express, { Request, Response } from 'express';
import { NotAuthError, currentUser, requireAuth } from '@tlbooktrading/common';

import { User } from '../models/user';
import { UserDeletedPublisher } from '../events/publisher/userDeletedPublisher';
import { natsWrapper } from '../natsWrapper';

const router = express.Router();

router.delete('/api/users/:id', currentUser, requireAuth, async (req: Request, res: Response) => {
    if (req.params.id !== req.currentUser!.id) {
        throw new NotAuthError('Not Authorized');
    }
    new UserDeletedPublisher(natsWrapper.client).publish({
        id: req.params.id,
    });
    await User.deleteOne({ _id: req.params.id });
    req.session = null;

    res.send({});
});

export { router as deleteRouter };
