import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../../app';
import { User } from '../../models/user';
import { Book } from '../../models/book';

const buildUser = async ({ id, email, userName }: { id: string; email: string; userName: string }) => {
    const user = User.build({
        id,
        email,
        password: 'Password1!',
        city: 'NY',
        name: 'test',
        userName,
    });
    await user.save();

    const cookie = await getCookie({ id, email });

    return { user, cookie };
};

const idOne = new mongoose.Types.ObjectId().toHexString();
const idTwo = new mongoose.Types.ObjectId().toHexString();

it('passes all requests routes', async () => {
    // Create two users
    const { user: userOne, cookie: cookieOne } = await buildUser({
        id: idOne,
        email: 'test@test.com',
        userName: 'test',
    });
    const { user: userTwo, cookie: cookieTwo } = await buildUser({
        id: idTwo,
        email: 'test123@test.com',
        userName: 'test123',
    });

    // Create one book for each user
    const bookOne = Book.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'New Book One',
        user: userOne,
    });
    await bookOne.save();
    const bookTwo = Book.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'New Book Two',
        user: userTwo,
    });
    await bookTwo.save();

    // Cannot trade another user's books
    await request(app)
        .post('/api/requests')
        .set('Cookie', cookieOne)
        .send({ fromBookId: bookTwo.id, toBookId: bookOne.id })
        .expect(401);
    // Successful request
    const requestTest = await request(app)
        .post('/api/requests')
        .set('Cookie', cookieOne)
        .send({ fromBookId: bookOne.id, toBookId: bookTwo.id })
        .expect(201);

    // Sucessful retrieval of the requests
    const requests = await request(app)
        .get(`/api/requests/user/${userOne.id}`)
        .set('Cookie', cookieOne)
        .send({});

    expect(requests.body).toHaveLength(1);

    // returns 401 when trying to access another user's requests list
    await request(app).get(`/api/requests/user/${userOne.id}`).set('Cookie', cookieTwo).send({}).expect(401);

    // returns 401 when trying to delete another user's request
    await request(app)
        .delete(`/api/requests/${requestTest.body.id}`)
        .set('Cookie', cookieTwo)
        .send({})
        .expect(401);

    // successfully deletes user's request
    await request(app)
        .delete(`/api/requests/${requestTest.body.id}`)
        .set('Cookie', cookieOne)
        .send({})
        .expect(200);

    const requestUserOne = await request(app)
        .get(`/api/requests/user/${userOne.id}`)
        .set('Cookie', cookieOne)
        .send({});

    expect(requestUserOne.body).toHaveLength(0);
});
