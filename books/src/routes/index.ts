import express, { Request, Response } from 'express';
import { Book } from '../models/books';

const router = express.Router();

router.get('/api/books/', async (req: Request, res: Response) => {
    const books = await Book.find({}).populate('user');
    res.send(books);
});

export { router as indexBookRouter };
