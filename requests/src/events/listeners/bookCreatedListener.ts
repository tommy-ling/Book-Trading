import { Message } from 'node-nats-streaming';
import { Listener, Channels, BookCreatedEvent, BadReqError } from '@tlbooktrading/common';
import { queueGroupName } from './queueGroupName';
import { Book } from '../../models/book';
import { User } from '../../models/user';

export class BookCreatedListener extends Listener<BookCreatedEvent> {
    readonly subject = Channels.BookCreated;
    queueGroupName = queueGroupName;

    async onMessage(data: BookCreatedEvent['data'], msg: Message) {
        const { id, userId, title } = data;
        const user = await User.findById(userId);

        if (!user) {
            throw new BadReqError('User does not exist');
        }

        const book = Book.build({
            id,
            title,
            user,
        });
        await book.save();

        msg.ack();
    }
}
