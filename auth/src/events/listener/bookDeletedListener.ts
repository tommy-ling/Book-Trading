import { Message } from 'node-nats-streaming';
import { Listener, Channels, BookDeletedEvent, BadReqError } from '@tlbooktrading/common';
import { queueGroupName } from './queueGroupName';
import { User } from '../../models/user';
import { UserUpdatedPublisher } from '../publisher/userUpdatedPublisher';
import { natsWrapper } from '../../natsWrapper';

export class BookDeletedListener extends Listener<BookDeletedEvent> {
    readonly subject = Channels.BookDeleted;
    queueGroupName = queueGroupName;

    async onMessage(data: BookDeletedEvent['data'], msg: Message) {
        const { id, userId } = data;
        const user = await User.findById(userId);
        if (!user) {
            throw new BadReqError('User does not exist');
        }
        const newBookId = user.bookId?.filter((bookId) => bookId !== id);
        user.set({ bookId: newBookId });

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
