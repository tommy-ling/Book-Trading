import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../../app';
import { User } from '../../models/user';

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

it('fetches books for all users AND specific users only', async () => {
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

    // Create one book as User #1
    const { body: bookOne } = await request(app)
        .post('/api/books')
        .set('Cookie', cookieOne)
        .send({ title: 'New Book', user: userOne })
        .expect(201);

    // Create two books as User #2
    await request(app)
        .post('/api/books')
        .set('Cookie', cookieTwo)
        .send({ title: 'New User Book', user: userTwo })
        .expect(201);
    const { body: bookThree } = await request(app)
        .post('/api/books')
        .set('Cookie', cookieTwo)
        .send({ title: 'New User Book1', user: userTwo })
        .expect(201);

    // Make request to get the books for all users
    const response = await request(app).get('/api/books').set('Cookie', cookieTwo).expect(200);

    // Make sure we got the books for all users
    expect(response.body.length).toEqual(3);
    expect(response.body[0].title).toEqual('New Book');
    expect(response.body[1].user).toEqual(userTwo.id);
    expect(response.body[2].id).toEqual(bookThree.id);

    // Make sure we only got the books for a specific user
    const responseUserOneOnly = await request(app)
        .get(`/api/books/user/${userOne.id}`)
        .set('Cookie', cookieOne)
        .expect(200);
    expect(responseUserOneOnly.body.length).toEqual(1);
    expect(responseUserOneOnly.body[0].user).toEqual(userOne.id);
    expect(responseUserOneOnly.body[0].id).toEqual(bookOne.id);

    await request(app).get(`/api/books/${bookThree.id}`).set('Cookie', cookieTwo).expect(200);
    await request(app).get(`/api/books/${bookThree.id}`).set('Cookie', cookieOne).expect(200);
});

it('deletes books from a specific user that is logged in AND returns error when an unauthorized user tried to delete', async () => {
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

    const { body: bookOne } = await request(app)
        .post('/api/books')
        .set('Cookie', cookieOne)
        .send({ title: 'New Book', user: userOne })
        .expect(201);

    await request(app)
        .post('/api/books')
        .set('Cookie', cookieTwo)
        .send({ title: 'New User Book', user: userTwo })
        .expect(201);
    await request(app)
        .post('/api/books')
        .set('Cookie', cookieTwo)
        .send({ title: 'New User Book1', user: userTwo })
        .expect(201);

    await request(app).delete(`/api/books/${bookOne.id}`).set('Cookie', cookieOne).expect(200);
    await request(app).delete(`/api/books/${bookOne.id}`).set('Cookie', cookieTwo).expect(401);
});
