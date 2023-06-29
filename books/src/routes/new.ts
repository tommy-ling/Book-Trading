import express, { Response, Request } from 'express';
import validator from 'validator';
import { ReqValError, BadReqError, requireAuth } from '@tlbooktrading/common';
import { Book } from '../models/books';
import { User } from '../models/user';
import { BookCreatedPublisher } from '../events/publishers/bookCreatedPublisher';
import { natsWrapper } from '../natsWrapper';

const router = express.Router();

router.post('/api/books', requireAuth, async (req: Request, res: Response) => {
    const { title } = req.body;

    if (validator.isEmpty(title)) {
        throw new ReqValError('Title must not be empty!');
    }

    const email = req.currentUser!.email;
    const user = await User.findOne({ email });
    if (!user) {
        throw new BadReqError('Cannot find the user that tries to create a new book.');
    }

    const book = Book.build({
        title,
        user,
    });

    await book.save();

    new BookCreatedPublisher(natsWrapper.client).publish({
        id: book.id,
        title: book.title,
        userId: user.id,
        version: book.version,
    });

    res.status(201).send(book);
});

export { router as createBookRouter };
