import mongoose from 'mongoose';
import { app } from './app';
import { natsWrapper } from './natsWrapper';
import { UserDeletedListener } from './events/listeners/userDeletedListener';
import { UserCreatedListener } from './events/listeners/userCreatedListener';
import { UserUpdatedListener } from './events/listeners/userUpdatedListener';
import { RequestCreatedListener } from './events/listeners/requestCreatedListener';
import { RequestDeletedListener } from './events/listeners/requestDeletedListener';
import { RequestMatchedListener } from './events/listeners/requestMatchedListener';
import { RequestMatchCancelledListener } from './events/listeners/requestMatchCancelledListener';

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

        new UserDeletedListener(natsWrapper.client).listen();
        new UserCreatedListener(natsWrapper.client).listen();
        new UserUpdatedListener(natsWrapper.client).listen();
        new RequestCreatedListener(natsWrapper.client).listen();
        new RequestDeletedListener(natsWrapper.client).listen();
        new RequestMatchedListener(natsWrapper.client).listen();
        new RequestMatchCancelledListener(natsWrapper.client).listen();

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
