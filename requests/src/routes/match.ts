import express, { Response, Request } from 'express';
import { BadReqError } from '@tlbooktrading/common';
import { natsWrapper } from '../natsWrapper';
import { RequestMatchedPublisher } from '../events/publishers/requestMatchedPublisher';
import { Request as BookRequest } from '../models/request';

const router = express.Router();

router.post('/api/requests/match', async (req: Request, res: Response) => {
    const request = await BookRequest.findById(req.body.id).populate('fromUser').populate('toBook');
    if (!request) {
        throw new BadReqError('Request not found.');
    }

    new RequestMatchedPublisher(natsWrapper.client).publish({
        id: request.id,
        toBookId: request.toBook._id,
        fromBookId: request.fromBook._id,
    });

    request.set({ currentStatus: 'confirmed' });
    await request.save();

    res.send({});
});

export { router as matchRequestRouter };
