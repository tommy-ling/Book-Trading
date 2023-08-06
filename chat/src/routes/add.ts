import express, { Response, Request } from 'express';
import { Chat } from '../models/chat';

const router = express.Router();

router.post('/api/chats', async (req: Request, res: Response) => {
    const { username, text, room } = req.body;
    const chat = Chat.build({ username, text, room, createdAt: new Date().getTime() });
    await chat.save();
    res.status(201);
});

export { router as addChatRouter };
