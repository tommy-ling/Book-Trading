import { Publisher, Channels, RequestMatchedEvent } from '@tlbooktrading/common';

export class RequestMatchedPublisher extends Publisher<RequestMatchedEvent> {
    readonly subject = Channels.RequestMatched;
}
