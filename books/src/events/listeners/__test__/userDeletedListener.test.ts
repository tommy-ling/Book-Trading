import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { UserDeletedEvent } from '@tlbooktrading/common';
import { UserDeletedListener } from '../userDeletedListener';
import { natsWrapper } from '../../../natsWrapper';
import { User } from '../../../models/user';

const setup = async () => {
    const listener = new UserDeletedListener(natsWrapper.client);

    const user = User.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        email: 'test@test.com',
        password: 'Password1!',
        name: 'test',
        userName: 'test',
        city: 'QC',
    });
    await user.save();

    const data: UserDeletedEvent['data'] = {
        id: user.id,
    };

    // @ts-ignore
    const msg: Message = {
        ack: jest.fn(),
    };

    return { listener, data, msg, user };
};

it('deletes the user', async () => {
    const { listener, data, msg, user } = await setup();
    await listener.onMessage(data, msg);

    const userTest = await User.findById(user.id);
    expect(userTest).toBeNull();
});

it('acks the message', async () => {
    const { listener, data, msg } = await setup();
    await listener.onMessage(data, msg);

    expect(msg.ack).toHaveBeenCalled();
});
