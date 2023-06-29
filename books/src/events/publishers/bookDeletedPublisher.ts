import { Publisher, Channels, BookDeletedEvent } from '@tlbooktrading/common';

export class BookDeletedPublisher extends Publisher<BookDeletedEvent> {
    readonly subject = Channels.BookDeleted;
}
