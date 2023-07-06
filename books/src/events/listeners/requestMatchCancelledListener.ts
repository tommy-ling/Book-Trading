import { Message } from 'node-nats-streaming';
import { Listener, RequestMatchCancelledEvent, Channels, BadReqError } from '@tlbooktrading/common';
import { queueGroupName } from './queueGroupName';
import { Book } from '../../models/books';
import { BookUpdatedPublisher } from '../publishers/bookUpdatedPublisher';
import { natsWrapper } from '../../natsWrapper';

export class RequestMatchCancelledListener extends Listener<RequestMatchCancelledEvent> {
    readonly subject = Channels.RequestMatchCancelled;
    queueGroupName = queueGroupName;

    async onMessage(data: RequestMatchCancelledEvent['data'], msg: Message) {
        const { id, toBookId, fromBookId } = data;
        const toBook = await Book.findById(toBookId).populate('user');
        const fromBook = await Book.findById(fromBookId).populate('user');
        if (!toBook || !fromBook) {
            throw new BadReqError('Book does not exist');
        }
        toBook.set({ currentStatus: null });
        const newRequestId = toBook.requestId?.filter((requestId) => requestId !== id);
        toBook.set({ requestId: newRequestId });

        fromBook.set({ currentStatus: null });

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
