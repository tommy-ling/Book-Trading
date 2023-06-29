import request from 'supertest';
import { app } from '../../app';

it('returns a 201 on successful signup', async () => {
    return request(app)
        .post('/api/users/signup/')
        .send({
            email: 'test@test.com',
            password: 'Password1!',
            city: 'NY',
            name: 'test',
            userName: 'test',
        })
        .expect(201);
});

it('returns a 400 on invalid email', async () => {
    return request(app)
        .post('/api/users/signup/')
        .send({
            email: 'testtestcom',
            password: 'Password1!',
            city: 'NY',
            name: 'test',
            userName: 'test',
        })
        .expect(400);
});
it('returns a 400 on invalid password', async () => {
    return request(app)
        .post('/api/users/signup/')
        .send({
            email: 'test@test.com',
            password: 'Password',
            city: 'NY',
            name: 'test',
            userName: 'test',
        })
        .expect(400);
});
it('returns a 400 with missing email and password', async () => {
    return request(app)
        .post('/api/users/signup/')
        .send({
            email: '',
            password: '',
            city: 'NY',
            name: 'test',
            userName: 'test',
        })
        .expect(400);
});

it('disallows duplicate emails', async () => {
    await request(app)
        .post('/api/users/signup/')
        .send({
            email: 'test@test.com',
            password: 'Password1!',
            city: 'NY',
            name: 'test',
            userName: 'test',
        })
        .expect(201);
    await request(app)
        .post('/api/users/signup/')
        .send({
            email: 'test@test.com',
            password: 'Password1!',
            city: 'NY',
            name: 'test',
            userName: 'test1',
        })
        .expect(400);
});
it('disallows duplicate useNames', async () => {
    await request(app)
        .post('/api/users/signup/')
        .send({
            email: 'test@test.com',
            password: 'Password1!',
            city: 'NY',
            name: 'test',
            userName: 'test',
        })
        .expect(201);
    await request(app)
        .post('/api/users/signup/')
        .send({
            email: 'test1@test.com',
            password: 'Password1!',
            city: 'NY',
            name: 'test',
            userName: 'test',
        })
        .expect(400);
});

it('sets a cookie after successful signup', async () => {
    const response = await request(app)
        .post('/api/users/signup/')
        .send({
            email: 'test@test.com',
            password: 'Password1!',
            city: 'NY',
            name: 'test',
            userName: 'test',
        })
        .expect(201);

    expect(response.get('Set-Cookie')).toBeDefined();
});
