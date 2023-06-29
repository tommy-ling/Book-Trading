import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { BookCreatedEvent } from '@tlbooktrading/common';
import { BookCreatedListener } from '../bookCreatedListener';
import { natsWrapper } from '../../../natsWrapper';
import { Book } from '../../../models/book';
import { User } from '../../../models/user';

const setup = async () => {
    const listener = new BookCreatedListener(natsWrapper.client);

    const user = User.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        email: 'test@test.com',
        password: 'Password1!',
        name: 'test',
        userName: 'test',
        city: 'QC',
    });

    await user.save();

    const data: BookCreatedEvent['data'] = {
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'New Book One',
        userId: user.id,
        version: 0,
    };

    // @ts-ignore
    const msg: Message = {
        ack: jest.fn(),
    };

    return { listener, data, msg, user };
};

it('creates and saves a book related to the user', async () => {
    const { listener, data, msg, user } = await setup();
    await listener.onMessage(data, msg);

    const bookTest = await Book.findById(data.id).populate('user');
    expect(bookTest).toBeDefined();
    expect(bookTest!.user.id).toEqual(user.id);
});

it('acks the message', async () => {
    const { listener, data, msg } = await setup();
    await listener.onMessage(data, msg);

    expect(msg.ack).toHaveBeenCalled();
});
