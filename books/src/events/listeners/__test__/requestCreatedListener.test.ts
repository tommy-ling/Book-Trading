import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { RequestCreatedEvent } from '@tlbooktrading/common';
import { RequestCreatedListener } from '../requestCreatedListener';
import { natsWrapper } from '../../../natsWrapper';
import { Book } from '../../../models/books';
import { User } from '../../../models/user';

const setup = async () => {
    const user = User.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        email: 'test@test.com',
        password: 'Password1!',
        name: 'test',
        userName: 'test',
        city: 'QC',
    });

    await user.save();

    const book = Book.build({
        title: 'New Book',
        user,
    });

    await book.save();

    const listener = new RequestCreatedListener(natsWrapper.client);

    const data: RequestCreatedEvent['data'] = {
        id: new mongoose.Types.ObjectId().toHexString(),
        version: 0,
        fromUserId: new mongoose.Types.ObjectId().toHexString(),
        toUserId: user.id,
        fromBookId: new mongoose.Types.ObjectId().toHexString(),
        toBookId: book.id,
        status: 'pending',
    };

    // @ts-ignore
    const msg: Message = {
        ack: jest.fn(),
    };

    return { listener, data, msg, book };
};

it('publishes a book updated event', async () => {
    const { listener, data, msg, book } = await setup();
    await listener.onMessage(data, msg);

    expect(natsWrapper.client.publish).toHaveBeenCalled();

    const reqCreatedData = JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1]);
    expect(reqCreatedData.id).toEqual(book.id);
    expect(reqCreatedData.version).toEqual(book.version + 1);
});

it('updates book requestId array', async () => {
    const { listener, data, msg, book } = await setup();
    await listener.onMessage(data, msg);

    const bookInDB = await Book.findById(book.id);
    expect(bookInDB).toBeDefined();
    expect(bookInDB!.requestId).toEqual([`${data.id}`]);
});

it('acks the message', async () => {
    const { listener, data, msg } = await setup();
    await listener.onMessage(data, msg);

    expect(msg.ack).toHaveBeenCalled();
});
