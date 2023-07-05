import express, { Response, Request } from 'express';
import { BadReqError, NotAuthError } from '@tlbooktrading/common';
import { natsWrapper } from '../natsWrapper';
import { RequestCreatedPublisher } from '../events/publishers/requestCreatedPublisher';
import { Request as BookRequest } from '../models/request';
import { Book } from '../models/book';
import { User } from '../models/user';

const router = express.Router();

router.post('/api/requests', async (req: Request, res: Response) => {
    const { fromBookId, toBookId } = req.body;
    const fromBook = await Book.findById(fromBookId).populate('user');
    const toBook = await Book.findById(toBookId).populate('user');
    if (!fromBook || !toBook) {
        throw new BadReqError('Cannot find the book requested');
    }
    if (fromBook.user.id !== req.currentUser!.id) {
        throw new NotAuthError('Not authorized to trade this book');
    }
    const fromUser = await User.findById(req.currentUser!.id);
    const toUser = await User.findById(toBook.user.id);
    if (!fromUser || !toUser) {
        throw new BadReqError('Cannot find the book of the user requested');
    }

    const request = BookRequest.build({
        fromUser,
        toUser,
        fromBook,
        toBook,
        currentStatus: 'pending',
    });

    await request.save();

    new RequestCreatedPublisher(natsWrapper.client).publish({
        id: request.id,
        fromBookId: fromBookId,
        toBookId: toBookId,
        fromUserId: fromUser.id,
        toUserId: toUser.id,
        status: request.currentStatus,
        version: request.version,
    });

    res.status(201).send(request);
});

export { router as createRequestRouter };
