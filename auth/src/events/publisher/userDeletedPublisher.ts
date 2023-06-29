import { Publisher, Channels, UserDeletedEvent } from '@tlbooktrading/common';

export class UserDeletedPublisher extends Publisher<UserDeletedEvent> {
    readonly subject = Channels.UserDeleted;
}
