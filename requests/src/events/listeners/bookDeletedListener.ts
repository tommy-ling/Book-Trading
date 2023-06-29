import { Message } from 'node-nats-streaming';
import { Listener, Channels, BookDeletedEvent } from '@tlbooktrading/common';
import { queueGroupName } from './queueGroupName';
import { Book } from '../../models/book';
import { Request } from '../../models/request';
import { RequestDeletedPublisher } from '../publishers/requestDeletedPublisher';
import { natsWrapper } from '../../natsWrapper';

export class BookDeletedListener extends Listener<BookDeletedEvent> {
    readonly subject = Channels.BookDeleted;
    queueGroupName = queueGroupName;

    async onMessage(data: BookDeletedEvent['data'], msg: Message) {
        const { id } = data;
        const book = await Book.findById(id);

        const fromBookRequests = await Request.find({ fromBook: book });
        for (let i = 0; i < fromBookRequests.length; i++) {
            new RequestDeletedPublisher(natsWrapper.client).publish({
                id: fromBookRequests[i]._id,
                toBookId: fromBookRequests[i].toBook._id,
            });

            await Request.deleteOne({ fromBook: book });
        }

        await Request.deleteMany({ toBook: book });
        await Book.deleteOne({ _id: id });

        msg.ack();
    }
}
