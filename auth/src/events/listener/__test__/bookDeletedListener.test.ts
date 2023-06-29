import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { BookDeletedEvent } from '@tlbooktrading/common';
import { BookDeletedListener } from '../bookDeletedListener';
import { natsWrapper } from '../../../natsWrapper';
import { User } from '../../../models/user';

const bookIdOne = new mongoose.Types.ObjectId().toHexString();
const bookIdTwo = new mongoose.Types.ObjectId().toHexString();

const setup = async () => {
    const listener = new BookDeletedListener(natsWrapper.client);

    const user = User.build({
        email: 'test@test.com',
        password: 'Password1!',
        name: 'test',
        userName: 'test',
        city: 'QC',
    });
    await user.save();

    user.bookId?.push(bookIdOne);
    user.bookId?.push(bookIdTwo);

    await user.save();

    const data: BookDeletedEvent['data'] = {
        id: bookIdOne,
        userId: user.id,
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

    const bookDeletedData = JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1]);
    expect(bookDeletedData.version).toEqual(user.version + 1);
});

it('deletes the right book from the user.bookId array', async () => {
    const { listener, data, msg, user } = await setup();
    expect(user.bookId).toHaveLength(2);
    expect(user.bookId![0]).toEqual(bookIdOne);
    expect(user.bookId![1]).toEqual(bookIdTwo);
    await listener.onMessage(data, msg);

    const userTest = await User.findById(user.id);
    expect(userTest!.bookId![0]).toEqual(bookIdTwo);
});

it('acks the message', async () => {
    const { listener, data, msg } = await setup();
    await listener.onMessage(data, msg);

    expect(msg.ack).toHaveBeenCalled();
});
