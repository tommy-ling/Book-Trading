import mongoose from 'mongoose';
import { app } from './app';
import { natsWrapper } from './natsWrapper';

import { BookCreatedListener } from './events/listeners/bookCreatedListener';
import { BookDeletedListener } from './events/listeners/bookDeletedListener';
import { BookUpdatedListener } from './events/listeners/bookUpdatedListener';
import { UserCreatedListener } from './events/listeners/userCreatedListener';
import { UserUpdatedListener } from './events/listeners/userUpdatedListener';
import { UserDeletedListener } from './events/listeners/userDeletedListener';

const start = async () => {
    console.log('Starting Up...');
    if (!process.env.JWT_KEY) {
        throw new Error('JWT_KEY must be defined');
    }
    if (!process.env.MONGO_URI) {
        throw new Error('MONGO_URI must be defined');
    }
    if (!process.env.NATS_CLUSTER_ID) {
        throw new Error('NATS_CLUSTER_ID must be defined');
    }
    if (!process.env.NATS_CLIENT_ID) {
        throw new Error('NATS_CLIENT_ID must be defined');
    }
    if (!process.env.NATS_URL) {
        throw new Error('NATS_URL must be defined');
    }

    try {
        await natsWrapper.connect(
            process.env.NATS_CLUSTER_ID,
            process.env.NATS_CLIENT_ID,
            process.env.NATS_URL
        );
        natsWrapper.client.on('close', () => {
            console.log('NATS connection closed!');
            process.exit();
        });
        process.on('SIGINT', () => natsWrapper.client.close());
        process.on('SIGTERM', () => natsWrapper.client.close());

        new BookCreatedListener(natsWrapper.client).listen();
        new BookDeletedListener(natsWrapper.client).listen();
        new BookUpdatedListener(natsWrapper.client).listen();
        new UserCreatedListener(natsWrapper.client).listen();
        new UserUpdatedListener(natsWrapper.client).listen();
        new UserDeletedListener(natsWrapper.client).listen();

        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');
    } catch (err) {
        console.log(err);
    }

    app.listen(3000, () => {
        console.log('Listening on 3000!!!');
    });
};

start();
