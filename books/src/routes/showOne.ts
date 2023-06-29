import express, { Response, Request } from 'express';
import { BadReqError, requireAuth } from '@tlbooktrading/common';
import { Book } from '../models/books';

const router = express.Router();

router.get('/api/books/:id', requireAuth, async (req: Request, res: Response) => {
    const book = await Book.findById(req.params.id).populate('user');
    if (!book) {
        throw new BadReqError('No book found.');
    }

    res.send(book);
});

export { router as showOneBookRouter };
