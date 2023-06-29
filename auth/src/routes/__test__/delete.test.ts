import request from 'supertest';
import { app } from '../../app';

it('deletes the user after delete', async () => {
    const { cookie, id } = await getCookie();

    await request(app).delete(`/api/users/${id}`).set('Cookie', cookie).send({}).expect(200);

    await request(app)
        .post('/api/users/signin')
        .send({
            email: 'test@test.com',
            password: 'Password1!',
        })
        .expect(400);
});
