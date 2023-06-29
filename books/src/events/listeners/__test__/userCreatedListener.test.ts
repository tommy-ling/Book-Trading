import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { UserCreatedEvent } from '@tlbooktrading/common';
import { UserCreatedListener } from '../userCreatedListener';
import { natsWrapper } from '../../../natsWrapper';
import { User } from '../../../models/user';

const setup = async () => {
    const listener = new UserCreatedListener(natsWrapper.client);

    const data: UserCreatedEvent['data'] = {
        id: new mongoose.Types.ObjectId().toHexString(),
        version: 0,
        email: 'test@test.com',
        password: 'Password1!',
        name: 'test',
        userName: 'test',
        city: 'QC',
    };

    // @ts-ignore
    const msg: Message = {
        ack: jest.fn(),
    };

    return { listener, data, msg };
};

it('creates and saves a user', async () => {
    const { listener, data, msg } = await setup();
    await listener.onMessage(data, msg);

    const user = await User.findById(data.id);
    expect(user).toBeDefined();
    expect(user!.email).toEqual(data.email);
    expect(user!.userName).toEqual(data.userName);
});

it('acks the message', async () => {
    const { listener, data, msg } = await setup();
    await listener.onMessage(data, msg);

    expect(msg.ack).toHaveBeenCalled();
});
