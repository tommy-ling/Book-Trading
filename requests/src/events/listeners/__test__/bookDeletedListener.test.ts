import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { BookDeletedEvent } from '@tlbooktrading/common';
import { BookDeletedListener } from '../bookDeletedListener';
import { natsWrapper } from '../../../natsWrapper';
import { Book } from '../../../models/book';
import { Request } from '../../../models/request';
import { User } from '../../../models/user';

const setup = async () => {
    const listener = new BookDeletedListener(natsWrapper.client);

    const userOne = User.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        email: 'test1@test.com',
        password: 'Password1!',
        name: 'test1',
        userName: 'test1',
        city: 'QC',
    });
    await userOne.save();
    const userTwo = User.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        email: 'test2@test.com',
        password: 'Password1!',
        name: 'test2',
        userName: 'test2',
        city: 'QC',
    });
    await userTwo.save();

    const bookOne = Book.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'New Book One',
        user: userOne,
    });
    await bookOne.save();
    const bookTwo = Book.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'New Book Two',
        user: userTwo,
    });
    await bookTwo.save();
    const bookThree = Book.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'New Book Three',
        user: userTwo,
    });
    await bookThree.save();

    const reqOne = Request.build({
        fromUser: userOne,
        toUser: userTwo,
        fromBook: bookOne,
        toBook: bookTwo,
        status: 'pending',
    });

    const reqTwo = Request.build({
        fromUser: userTwo,
        toUser: userOne,
        fromBook: bookThree,
        toBook: bookOne,
        status: 'pending',
    });

    const data: BookDeletedEvent['data'] = {
        id: bookOne.id,
        userId: userOne.id,
    };

    // @ts-ignore
    const msg: Message = {
        ack: jest.fn(),
    };

    return { listener, data, msg, reqOne, reqTwo };
};

it('deletes the book and the requests tied to it', async () => {
    const { listener, data, msg, reqOne, reqTwo } = await setup();
    await listener.onMessage(data, msg);

    const reqOneTest = await Request.findById(reqOne.id);
    expect(reqOneTest).toBeNull();
    const reqTwoTest = await Request.findById(reqTwo.id);
    expect(reqTwoTest).toBeNull();
    const bookOneTest = await Book.findById(data.id);
    expect(bookOneTest).toBeNull();
});

it('acks the message', async () => {
    const { listener, data, msg } = await setup();
    await listener.onMessage(data, msg);

    expect(msg.ack).toHaveBeenCalled();
});
