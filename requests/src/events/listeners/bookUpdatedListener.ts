import { Message } from 'node-nats-streaming';
import { Listener, BookUpdatedEvent, Channels } from '@tlbooktrading/common';
import { queueGroupName } from './queueGroupName';
import { Book } from '../../models/book';

export class BookUpdatedListener extends Listener<BookUpdatedEvent> {
    readonly subject = Channels.BookUpdated;
    queueGroupName = queueGroupName;

    async onMessage(data: BookUpdatedEvent['data'], msg: Message) {
        const book = await Book.findByEvent(data);
        if (!book) {
            throw new Error('Book not found');
        }

        const { id, title, userId, currentStatus } = data;
        book.set({ id, title, userId, currentStatus });

        await book.save();

        msg.ack();
    }
}
