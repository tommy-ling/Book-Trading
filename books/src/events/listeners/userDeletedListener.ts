import { Message } from 'node-nats-streaming';
import { Listener, UserDeletedEvent, Channels } from '@tlbooktrading/common';
import { queueGroupName } from './queueGroupName';
import { User } from '../../models/user';
import { Book } from '../../models/books';

export class UserDeletedListener extends Listener<UserDeletedEvent> {
    readonly subject = Channels.UserDeleted;
    queueGroupName = queueGroupName;

    async onMessage(data: UserDeletedEvent['data'], msg: Message) {
        const user = await User.findOne({ _id: data.id });
        await Book.deleteMany({ user });
        await User.deleteOne({ _id: data.id });
        msg.ack();
    }
}
