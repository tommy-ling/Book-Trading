import { Publisher, Channels, UserUpdatedEvent } from '@tlbooktrading/common';

export class UserUpdatedPublisher extends Publisher<UserUpdatedEvent> {
    readonly subject = Channels.UserUpdated;
}
