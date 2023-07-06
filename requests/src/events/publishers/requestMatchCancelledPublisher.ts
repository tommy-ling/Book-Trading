import { Publisher, Channels, RequestMatchCancelledEvent } from '@tlbooktrading/common';

export class RequestMatchCancelledPublisher extends Publisher<RequestMatchCancelledEvent> {
    readonly subject = Channels.RequestMatchCancelled;
}
