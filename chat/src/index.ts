import express from 'express';
import mongoose from 'mongoose';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { json } from 'body-parser';
import { addUser, getUser, generateMessage } from '@tlbooktrading/common';
import { indexChatRouter } from './routes';
import { addChatRouter } from './routes/add';

const app = express();
app.set('trust proxy', true);
app.use(json());
app.use(indexChatRouter);
app.use(addChatRouter);

const server = createServer(app);

const io = new Server(server);
const nsp = io.of('/chat');

let socketid: string;

const connectMongo = async () => {
    if (!process.env.MONGO_URI) {
        throw new Error('MONGO_URI must be defined');
    }
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');
    } catch (error) {
        console.log(error);
    }
};

connectMongo();

nsp.on('connection', (socket) => {
    console.log('New web socket connection');

    socket.on('join', ({ username, room, id }, callback) => {
        socketid = id;
        const { error, user } = addUser({ id: socketid, username, room });
        if (error) {
            return callback(error);
        }

        socket.join(user!.room);

        socket.emit('message', generateMessage('Admin', `Welcome, ${user!.username}!`));
        socket.broadcast
            .to(user!.room)
            .emit('message', generateMessage('Admin', `${user!.username} has joined!`));

        callback();
    });

    socket.on('sendMessage', ({ message, id, room }, callback) => {
        const user = getUser(id, room);
        nsp.to(user!.room).emit('message', generateMessage(user!.username, message));
        callback();
    });
});

server.listen(3000, () => {
    console.log(`Listening on 3000!`);
});
