import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { UserUpdatedEvent } from '@tlbooktrading/common';
import { UserUpdatedListener } from '../userUpdatedListener';
import { natsWrapper } from '../../../natsWrapper';
import { User } from '../../../models/user';

const setup = async () => {
    const listener = new UserUpdatedListener(natsWrapper.client);

    const user = User.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        email: 'test@test.com',
        password: 'Password1!',
        name: 'test',
        userName: 'test',
        city: 'NY',
    });
    await user.save();

    const data: UserUpdatedEvent['data'] = {
        id: user.id,
        email: user.email,
        userName: user.userName,
        version: parseInt(user.version) + 1,
        password: 'Password2!',
        name: 'test123',
        city: 'QC',
    };

    // @ts-ignore
    const msg: Message = {
        ack: jest.fn(),
    };

    return { listener, data, msg, user };
};

it('updates user info', async () => {
    const { listener, data, msg, user } = await setup();
    await listener.onMessage(data, msg);

    const userTest = await User.findById(user.id);
    expect(userTest).toBeDefined();
    expect(userTest!.name).toEqual(data.name);
    expect(userTest!.password).toEqual(data.password);
    expect(userTest!.city).toEqual(data.city);
});

it('acks the message', async () => {
    const { listener, data, msg } = await setup();
    await listener.onMessage(data, msg);

    expect(msg.ack).toHaveBeenCalled();
});
