import { Message } from 'node-nats-streaming';
import { Listener, Channels, BookCreatedEvent, BadReqError } from '@tlbooktrading/common';
import { queueGroupName } from './queueGroupName';
import { User } from '../../models/user';
import { UserUpdatedPublisher } from '../publisher/userUpdatedPublisher';
import { natsWrapper } from '../../natsWrapper';

export class BookCreatedListener extends Listener<BookCreatedEvent> {
    readonly subject = Channels.BookCreated;
    queueGroupName = queueGroupName;

    async onMessage(data: BookCreatedEvent['data'], msg: Message) {
        const { id, userId } = data;
        const user = await User.findById(userId);

        if (!user) {
            throw new BadReqError('User does not exist');
        }
        user.bookId?.push(id);
        await user.save();

        new UserUpdatedPublisher(natsWrapper.client).publish({
            id: user.id,
            email: user.email,
            password: user.password,
            name: user.name,
            userName: user.userName,
            city: user.city,
            version: user.version,
        });

        msg.ack();
    }
}
