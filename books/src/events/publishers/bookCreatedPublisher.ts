import { Publisher, Channels, BookCreatedEvent } from '@tlbooktrading/common';

export class BookCreatedPublisher extends Publisher<BookCreatedEvent> {
    readonly subject = Channels.BookCreated;
}
