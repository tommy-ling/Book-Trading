import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { RequestDeletedEvent } from '@tlbooktrading/common';
import { RequestDeletedListener } from '../requestDeletedListener';
import { natsWrapper } from '../../../natsWrapper';
import { Book } from '../../../models/books';
import { User } from '../../../models/user';

const requestIdOne = new mongoose.Types.ObjectId().toHexString();
const requestIdTwo = new mongoose.Types.ObjectId().toHexString();

const setup = async () => {
    const listener = new RequestDeletedListener(natsWrapper.client);

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

    book.requestId?.push(requestIdOne);
    book.requestId?.push(requestIdTwo);

    await book.save();

    const data: RequestDeletedEvent['data'] = {
        id: requestIdOne,
        toBookId: book.id,
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

    const requestDeletedData = JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1]);
    expect(requestDeletedData.version).toEqual(book.version + 1);
});

it('deletes the right request from the book.requestId array', async () => {
    const { listener, data, msg, book } = await setup();
    expect(book.requestId).toHaveLength(2);
    expect(book.requestId![0]).toEqual(requestIdOne);
    expect(book.requestId![1]).toEqual(requestIdTwo);
    await listener.onMessage(data, msg);

    const bookTest = await Book.findById(book.id);
    expect(bookTest!.requestId![0]).toEqual(requestIdTwo);
});

it('acks the message', async () => {
    const { listener, data, msg } = await setup();
    await listener.onMessage(data, msg);

    expect(msg.ack).toHaveBeenCalled();
});
