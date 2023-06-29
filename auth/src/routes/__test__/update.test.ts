import request from 'supertest';
import { app } from '../../app';
import { Password } from '../../resources/password';

it('returns 400 when the same password is passed', async () => {
    const { cookie, hashed } = await getCookie();

    await request(app)
        .put('/api/users/update')
        .set('Cookie', cookie)
        .send({
            name: 'test1',
            city: 'CA',
            password: 'Password1!',
        })
        .expect(400);
});

it('successfully updates user info', async () => {
    const { cookie, hashed } = await getCookie();
    const password = 'Password2!';

    const res = await request(app)
        .put('/api/users/update')
        .set('Cookie', cookie)
        .send({
            name: 'test1',
            city: 'CA',
            password,
        })
        .expect(200);

    const [hashedPassword, salt] = hashed.split('.');
    const newHashed = await Password.toHash(password, salt);

    expect(res.body.name).toEqual('test1');
    expect(res.body.city).toEqual('CA');
    expect(newHashed).not.toEqual(hashed);
});
