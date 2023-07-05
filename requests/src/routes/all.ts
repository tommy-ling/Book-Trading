import express, { Request, Response } from 'express';
import { Request as BookRequest } from '../models/request';

const router = express.Router();

router.get('/api/requests', async (req: Request, res: Response) => {
    const requests = await BookRequest.find({})
        .populate('fromUser')
        .populate('toUser')
        .populate('fromBook')
        .populate('toBook');

    res.send(requests);
});

export { router as allRequestRouter };
