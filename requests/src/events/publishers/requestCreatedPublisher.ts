import { Publisher, Channels, RequestCreatedEvent } from '@tlbooktrading/common';

export class RequestCreatedPublisher extends Publisher<RequestCreatedEvent> {
    readonly subject = Channels.RequestCreated;
}
