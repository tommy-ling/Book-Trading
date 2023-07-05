import { Message } from 'node-nats-streaming';
import { Listener, RequestDeletedEvent, Channels, BadReqError } from '@tlbooktrading/common';
import { queueGroupName } from './queueGroupName';
import { Book } from '../../models/books';
import { BookUpdatedPublisher } from '../publishers/bookUpdatedPublisher';
import { natsWrapper } from '../../natsWrapper';

export class RequestDeletedListener extends Listener<RequestDeletedEvent> {
    readonly subject = Channels.RequestDeleted;
    queueGroupName = queueGroupName;

    async onMessage(data: RequestDeletedEvent['data'], msg: Message) {
        const { id, toBookId } = data;
        const book = await Book.findById(toBookId).populate('user');
        if (!book) {
            throw new BadReqError('User does not exist');
        }
        const newRequestId = book.requestId?.filter((requestId) => requestId !== id);
        book.set({ requestId: newRequestId });

        await book.save();
        console.log(book.title, book.id, book.version);

        new BookUpdatedPublisher(natsWrapper.client).publish({
            id: book.id,
            title: book.title,
            userId: book.user.id,
            version: book.version,
            currentStatus: book.currentStatus,
        });

        msg.ack();
    }
}
