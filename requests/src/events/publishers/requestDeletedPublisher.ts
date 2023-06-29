import { Publisher, Channels, RequestDeletedEvent } from '@tlbooktrading/common';

export class RequestDeletedPublisher extends Publisher<RequestDeletedEvent> {
    readonly subject = Channels.RequestDeleted;
}
