import express, { Request, Response } from 'express';
import { NotAuthError } from '@tlbooktrading/common';
import { Request as BookRequest } from '../models/request';

const router = express.Router();

router.get('/api/requests/received/:userId', async (req: Request, res: Response) => {
    if (req.params.userId !== req.currentUser!.id) {
        throw new NotAuthError('Not authorized.');
    }

    const requests = await BookRequest.find({ toUser: req.params.userId })
        .populate('fromUser')
        .populate('fromBook')
        .populate('toBook');

    res.send(requests);
});

export { router as showReceivedRouter };
