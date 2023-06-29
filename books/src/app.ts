import express from 'express';
import 'express-async-errors';
import { json } from 'body-parser';
import cookieSession from 'cookie-session';
import { errorHandler, NotFoundError, currentUser } from '@tlbooktrading/common';

import { indexBookRouter } from './routes';
import { createBookRouter } from './routes/new';
import { showBookRouter } from './routes/show';
import { showOneBookRouter } from './routes/showOne';
import { deleteBookRouter } from './routes/delete';

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

app.use(indexBookRouter);
app.use(createBookRouter);
app.use(showBookRouter);
app.use(showOneBookRouter);
app.use(deleteBookRouter);

app.all('*', (req, res) => {
    throw new NotFoundError('Page Not Found');
});

app.use(errorHandler);

export { app };
