import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import request from 'supertest';
import { randomBytes } from 'crypto';
import { Password } from '../resources/password';

import { app } from '../app';

jest.mock('../natsWrapper');

declare global {
    var getCookie: () => Promise<{ cookie: string[]; hashed: string; id: string }>;
}

let mongo: any;
beforeAll(async () => {
    process.env.JWT_KEY = 'asdf';
    mongo = await MongoMemoryServer.create();
    const mongoUri = mongo.getUri();

    await mongoose.connect(mongoUri, {});
});

beforeEach(async () => {
    const collections = await mongoose.connection.db.collections();

    for (let collection of collections) {
        await collection.deleteMany({});
    }
});

afterAll(async () => {
    if (mongo) {
        await mongo.stop();
    }
    await mongoose.connection.close();
});

global.getCookie = async () => {
    const email = 'test@test.com';
    const password = 'Password1!';
    const city = 'NY';
    const name = 'test';
    const userName = 'test';

    const response = await request(app)
        .post('/api/users/signup')
        .send({
            email,
            password,
            city,
            name,
            userName,
        })
        .expect(201);

    const salt = randomBytes(8).toString('hex');
    const hashed = await Password.toHash(password, salt);

    const cookie = response.get('Set-Cookie');
    return { cookie, hashed, id: response.body.id };
};
