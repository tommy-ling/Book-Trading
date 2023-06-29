import express, { Response, Request } from 'express';
import { NotAuthError, requireAuth } from '@tlbooktrading/common';
import { Book } from '../models/books';
import { BookDeletedPublisher } from '../events/publishers/bookDeletedPublisher';
import { natsWrapper } from '../natsWrapper';

const router = express.Router();

router.delete('/api/books/:id', requireAuth, async (req: Request, res: Response) => {
    const book = await Book.findOne({ _id: req.params.id }).populate('user');
    const userId = req.currentUser!.id;
    if (book?.user.id !== userId) {
        throw new NotAuthError('Not authorized.');
    }

    new BookDeletedPublisher(natsWrapper.client).publish({
        id: book?.id,
        userId,
    });

    await Book.deleteOne({ _id: req.params.id });

    res.send({});
});

export { router as deleteBookRouter };
