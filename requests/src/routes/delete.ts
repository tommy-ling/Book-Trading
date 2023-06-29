import express, { Response, Request } from 'express';
import { BadReqError, NotAuthError } from '@tlbooktrading/common';
import { natsWrapper } from '../natsWrapper';
import { RequestDeletedPublisher } from '../events/publishers/requestDeletedPublisher';
import { Request as BookRequest } from '../models/request';

const router = express.Router();

router.delete('/api/requests/:id', async (req: Request, res: Response) => {
    const request = await BookRequest.findById(req.params.id).populate('fromUser').populate('toBook');
    if (!request) {
        throw new BadReqError('Request not found.');
    }

    new RequestDeletedPublisher(natsWrapper.client).publish({
        id: request.id,
        toBookId: request.toBook.id,
    });

    await request.deleteOne({ _id: request.id });

    res.send({});
});

export { router as deleteRequestRouter };
