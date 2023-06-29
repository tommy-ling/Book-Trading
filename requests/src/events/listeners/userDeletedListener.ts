import { Message } from 'node-nats-streaming';
import { Listener, UserDeletedEvent, Channels, BadReqError } from '@tlbooktrading/common';
import { queueGroupName } from './queueGroupName';
import { User } from '../../models/user';
import { Book } from '../../models/book';
import { Request } from '../../models/request';
import { RequestDeletedPublisher } from '../publishers/requestDeletedPublisher';
import { natsWrapper } from '../../natsWrapper';

export class UserDeletedListener extends Listener<UserDeletedEvent> {
    readonly subject = Channels.UserDeleted;
    queueGroupName = queueGroupName;

    async onMessage(data: UserDeletedEvent['data'], msg: Message) {
        const user = await User.findOne({ _id: data.id });
        if (!user) {
            throw new BadReqError('User not found');
        }

        const fromUserRequests = await Request.find({ fromUser: user });
        for (let i = 0; i < fromUserRequests.length; i++) {
            await new RequestDeletedPublisher(natsWrapper.client).publish({
                id: fromUserRequests[i]._id,
                toBookId: fromUserRequests[i].toBook._id,
            });

            await Request.deleteOne({ fromUser: user });
        }

        await Request.deleteMany({ toUser: user });

        await Book.deleteMany({ user });
        await User.deleteOne({ _id: data.id });

        msg.ack();
    }
}
