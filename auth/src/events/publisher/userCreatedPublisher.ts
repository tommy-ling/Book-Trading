import { Publisher, Channels, UserCreatedEvent } from '@tlbooktrading/common';

export class UserCreatedPublisher extends Publisher<UserCreatedEvent> {
    readonly subject = Channels.UserCreated;
}
