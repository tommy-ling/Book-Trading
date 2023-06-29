import request from 'supertest';
import { app } from '../../app';

it('responds with details about the current user', async () => {
    const { cookie, hashed } = await getCookie();

    const response = await request(app)
        .get('/api/users/currentuser')
        .set('Cookie', cookie)
        .send()
        .expect(200);

    expect(response.body.currentUser.email).toEqual('test@test.com');
});

it('responds with 401 Not Authorized status code if not authenticated', async () => {
    await request(app).get('/api/users/currentuser').send().expect(401);
});
