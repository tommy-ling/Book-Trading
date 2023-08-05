import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { addUser, removeUser, getUser, generateMessage } from '@tlbooktrading/common';

const app = express();
const server = createServer(app);
const io = new Server(server);

const nsp = io.of('/chat');
let socketid: string;

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

    socket.on('sendMessage', ({ message, id }, callback) => {
        const { user } = getUser(id);
        nsp.to(user!.room).emit('message', generateMessage(user!.username, message));
        callback();
    });

    socket.on('disconnect', () => {
        const user = removeUser(socketid);
        console.log('Disconnected!');
        if (user) {
            nsp.to(user.room).emit('message', generateMessage('Admin', `${user.username} has left`));
        }
    });
});

server.listen(3000, () => {
    console.log(`Listening on 3000!`);
});
