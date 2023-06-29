import { Message } from 'node-nats-streaming';
import { Listener, RequestCreatedEvent, Channels, BadReqError } from '@tlbooktrading/common';
import { queueGroupName } from './queueGroupName';
import { Book } from '../../models/books';
import { BookUpdatedPublisher } from '../publishers/bookUpdatedPublisher';
import { natsWrapper } from '../../natsWrapper';

export class RequestCreatedListener extends Listener<RequestCreatedEvent> {
    readonly subject = Channels.RequestCreated;
    queueGroupName = queueGroupName;

    async onMessage(data: RequestCreatedEvent['data'], msg: Message) {
        const { id, toBookId } = data;
        const book = await Book.findById(toBookId).populate('user');
        if (!book) {
            throw new BadReqError('User does not exist');
        }
        book.requestId?.push(id);
        await book.save();

        new BookUpdatedPublisher(natsWrapper.client).publish({
            id: book.id,
            title: book.title,
            userId: book.user.id,
            version: book.version,
        });

        msg.ack();
    }
}
