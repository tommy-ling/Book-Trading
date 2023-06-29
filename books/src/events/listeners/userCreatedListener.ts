import { Message } from 'node-nats-streaming';
import { Listener, UserCreatedEvent, Channels } from '@tlbooktrading/common';
import { queueGroupName } from './queueGroupName';
import { User } from '../../models/user';

export class UserCreatedListener extends Listener<UserCreatedEvent> {
    readonly subject = Channels.UserCreated;
    queueGroupName = queueGroupName;

    async onMessage(data: UserCreatedEvent['data'], msg: Message) {
        const { id, email, password, name, userName, city } = data;
        const user = User.build({ id, email, password, name, userName, city });
        await user.save();

        msg.ack();
    }
}
