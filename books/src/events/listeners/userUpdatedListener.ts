import { Message } from 'node-nats-streaming';
import { Listener, UserUpdatedEvent, Channels } from '@tlbooktrading/common';
import { queueGroupName } from './queueGroupName';
import { User } from '../../models/user';

export class UserUpdatedListener extends Listener<UserUpdatedEvent> {
    readonly subject = Channels.UserUpdated;
    queueGroupName = queueGroupName;

    async onMessage(data: UserUpdatedEvent['data'], msg: Message) {
        const user = await User.findByEvent(data);
        if (!user) {
            throw new Error('User not found');
        }

        const { password, name, city } = data;
        user.set({ password, name, city });

        await user.save();

        msg.ack();
    }
}
