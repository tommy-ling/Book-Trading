import express, { Request, Response } from 'express';
import { Chat } from '../models/chat';

const router = express.Router();

router.get('/api/chats', async (req: Request, res: Response) => {
    const chats = await Chat.find({});
    res.send(chats);
});

export { router as indexChatRouter };
