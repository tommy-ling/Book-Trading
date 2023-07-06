import express, { Response, Request } from 'express';
import { BadReqError } from '@tlbooktrading/common';
import { natsWrapper } from '../natsWrapper';
import { RequestMatchCancelledPublisher } from '../events/publishers/requestMatchCancelledPublisher';
import { Request as BookRequest } from '../models/request';

const router = express.Router();

router.post('/api/requests/matchcancel', async (req: Request, res: Response) => {
    const request = await BookRequest.findById(req.body.id).populate('fromUser').populate('toBook');
    if (!request) {
        throw new BadReqError('Request not found.');
    }

    new RequestMatchCancelledPublisher(natsWrapper.client).publish({
        id: request.id,
        toBookId: request.toBook._id,
        fromBookId: request.fromBook._id,
    });

    await BookRequest.deleteOne({ _id: request.id });

    res.send({});
});

export { router as matchCancelRouter };
