import express, { Response, Request } from 'express';
import { requireAuth } from '@tlbooktrading/common';
import { User } from '../models/user';
import { Book } from '../models/books';

const router = express.Router();

router.get('/api/books/user/:userId', requireAuth, async (req: Request, res: Response) => {
    const user = await User.findOne({ _id: req.params.userId });
    const books = await Book.find({ user }).populate('user');

    res.send(books);
});

export { router as showBookRouter };
