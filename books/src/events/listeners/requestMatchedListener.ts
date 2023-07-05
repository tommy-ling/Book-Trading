import { Message } from 'node-nats-streaming';
import { Listener, RequestMatchedEvent, Channels, BadReqError } from '@tlbooktrading/common';
import { queueGroupName } from './queueGroupName';
import { Book } from '../../models/books';
import { BookUpdatedPublisher } from '../publishers/bookUpdatedPublisher';
import { natsWrapper } from '../../natsWrapper';

export class RequestMatchedListener extends Listener<RequestMatchedEvent> {
    readonly subject = Channels.RequestMatched;
    queueGroupName = queueGroupName;

    async onMessage(data: RequestMatchedEvent['data'], msg: Message) {
        const { toBookId, fromBookId } = data;
        const toBook = await Book.findById(toBookId).populate('user');
        const fromBook = await Book.findById(fromBookId).populate('user');
        if (!toBook || !fromBook) {
            throw new BadReqError('Book does not exist');
        }
        toBook.set({ currentStatus: 'confirmed' });
        fromBook.set({ currentStatus: 'confirmed' });

        await toBook.save();
        await fromBook.save();

        new BookUpdatedPublisher(natsWrapper.client).publish({
            id: toBook.id,
            title: toBook.title,
            userId: toBook.user.id,
            version: toBook.version,
            currentStatus: toBook.currentStatus,
        });
        new BookUpdatedPublisher(natsWrapper.client).publish({
            id: fromBook.id,
            title: fromBook.title,
            userId: fromBook.user.id,
            version: fromBook.version,
            currentStatus: fromBook.currentStatus,
        });

        msg.ack();
    }
}
