import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { UserDeletedEvent } from '@tlbooktrading/common';
import { UserDeletedListener } from '../userDeletedListener';
import { natsWrapper } from '../../../natsWrapper';
import { User } from '../../../models/user';
import { Book } from '../../../models/book';
import { Request } from '../../../models/request';

const setup = async () => {
    const listener = new UserDeletedListener(natsWrapper.client);

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

    const data: UserDeletedEvent['data'] = {
        id: userTwo.id,
    };

    // @ts-ignore
    const msg: Message = {
        ack: jest.fn(),
    };

    return { listener, data, msg, userTwo };
};

it('deletes the books and the requests tied to the user and the user itself', async () => {
    const { listener, data, msg, userTwo } = await setup();
    await listener.onMessage(data, msg);

    const reqTo = await Request.find({ toUser: userTwo });
    expect(reqTo).toHaveLength(0);
    const reqFrom = await Request.find({ fromUser: userTwo });
    expect(reqFrom).toHaveLength(0);
    const books = await Book.find({ user: userTwo });
    expect(books).toHaveLength(0);
    const userTest = await Book.findById(data.id);
    expect(userTest).toBeNull();
});

it('acks the message', async () => {
    const { listener, data, msg } = await setup();
    await listener.onMessage(data, msg);

    expect(msg.ack).toHaveBeenCalled();
});
