import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { BookCreatedEvent } from '@tlbooktrading/common';
import { BookCreatedListener } from '../bookCreatedListener';
import { natsWrapper } from '../../../natsWrapper';
import { User } from '../../../models/user';

const setup = async () => {
    const listener = new BookCreatedListener(natsWrapper.client);
    const user = User.build({
        email: 'test@test.com',
        password: 'Password1!',
        name: 'test',
        userName: 'test',
        city: 'NY',
    });
    await user.save();

    const data: BookCreatedEvent['data'] = {
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'New Book',
        userId: user.id,
        version: 0,
    };

    // @ts-ignore
    const msg: Message = {
        ack: jest.fn(),
    };

    return { listener, data, msg, user };
};

it('publishes a user updated event', async () => {
    const { listener, data, msg, user } = await setup();
    await listener.onMessage(data, msg);

    expect(natsWrapper.client.publish).toHaveBeenCalled();

    const bookCreatedData = JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1]);
    expect(bookCreatedData.id).toEqual(user.id);
    expect(bookCreatedData.version).toEqual(user.version + 1);
});

it('updates user.bookId array when new book is created', async () => {
    const { listener, data, msg, user } = await setup();
    await listener.onMessage(data, msg);

    const userTest = await User.findById(user.id);
    expect(userTest).toBeDefined();
    expect(userTest!.bookId).toEqual([`${data.id}`]);
});

it('acks the message', async () => {
    const { listener, data, msg } = await setup();
    await listener.onMessage(data, msg);

    expect(msg.ack).toHaveBeenCalled();
});
