import { Publisher, Channels, BookUpdatedEvent } from '@tlbooktrading/common';

export class BookUpdatedPublisher extends Publisher<BookUpdatedEvent> {
    readonly subject = Channels.BookUpdated;
}
