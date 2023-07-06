import express from 'express';
import 'express-async-errors';
import { json } from 'body-parser';
import cookieSession from 'cookie-session';
import { errorHandler, NotFoundError, currentUser, requireAuth } from '@tlbooktrading/common';

import { indexRequestRouter } from './routes';
import { showReceivedRouter } from './routes/showReceived';
import { createRequestRouter } from './routes/new';
import { deleteRequestRouter } from './routes/delete';
import { matchRequestRouter } from './routes/match';
import { allRequestRouter } from './routes/all';
import { matchCancelRouter } from './routes/matchCancel';

const app = express();
app.set('trust proxy', true);
app.use(json());
app.use(
    cookieSession({
        signed: false,
        secure: process.env.NODE_ENV !== 'test',
    })
);

app.use(currentUser);
app.use(requireAuth);

app.use(indexRequestRouter);
app.use(showReceivedRouter);
app.use(createRequestRouter);
app.use(deleteRequestRouter);
app.use(matchRequestRouter);
app.use(matchCancelRouter);
app.use(allRequestRouter);

app.all('*', (req, res) => {
    throw new NotFoundError('Page Not Found');
});

app.use(errorHandler);

export { app };
