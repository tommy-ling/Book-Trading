import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { BookUpdatedEvent } from '@tlbooktrading/common';
import { BookUpdatedListener } from '../bookUpdatedListener';
import { natsWrapper } from '../../../natsWrapper';
import { User } from '../../../models/user';
import { Book } from '../../../models/book';

const setup = async () => {
    const listener = new BookUpdatedListener(natsWrapper.client);

    const user = User.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        email: 'test@test.com',
        password: 'Password1!',
        name: 'test',
        userName: 'test',
        city: 'NY',
    });
    await user.save();

    const bookOne = Book.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'New Book One',
        user,
    });
    await bookOne.save();

    const data: BookUpdatedEvent['data'] = {
        id: bookOne.id,
        title: 'New Book One',
        userId: user.id,
        version: parseInt(bookOne.version) + 1,
    };

    // @ts-ignore
    const msg: Message = {
        ack: jest.fn(),
    };

    return { listener, data, msg, bookOne };
};

it('updates book version', async () => {
    const { listener, data, msg, bookOne } = await setup();
    await listener.onMessage(data, msg);

    const bookTest = await Book.findById(bookOne.id);
    expect(bookTest).toBeDefined();
    expect(bookTest!.version).toEqual(data.version);
});

it('acks the message', async () => {
    const { listener, data, msg } = await setup();
    await listener.onMessage(data, msg);

    expect(msg.ack).toHaveBeenCalled();
});
