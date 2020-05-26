const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/user');
const { setupDatabase, userOne, userOneId } = require('./fixtures/db');

beforeEach(setupDatabase);

test('should singup a new user', async () => {
    const response = await request(app).post('/users').send({
        name: 'Luka Rosić',
        email: 'luka@test.com',
        password: 'testBanana1337'
    }).expect(201);

    // Assert that the database was changes correctly
    const user = await User.findById(response.body.user._id);
    expect(user).not.toBeNull();

    // Assertions about the response
    expect(response.body).toMatchObject({
        user: {
            name: 'Luka Rosić',
            email: 'luka@test.com'
        },
        token: user.tokens[0].token
    });
    expect(user.password).not.toBe('testBanana1337');
});

test('should login existing user', async () => {
    const response = await request(app).post('/users/login').send({
        email: userOne.email,
        password: userOne.password
    }).expect(200);
    const user = await User.findById(response.body.user._id);
    expect(response.body.token).toBe(user.tokens[1].token);
});

test('should not login nonexistent user', async () => {
    await request(app).post('/users/login').send({
        email: 'test@test.com',
        password: 'test12345!'
    }).expect(400);
});

test('should get profile for user', async () => {
    await request(app)
        .get('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200);
});

test('should not get profile for unauthenticated user', async () => {
    await request(app)
        .get('/users/me')
        .send()
        .expect(401);
});

test('should delete account for user', async () => {
    await request(app)
        .delete('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200);
    const user = await User.findById(userOneId);
    expect(user).toBeNull();
});

test('should not delete account for unauthenticated user', async () => {
    await request(app)
        .delete('/users/me')
        .send()
        .expect(401);
});

test('should upload avatar image', async () => {
    await request(app)
        .post('/users/me/avatar')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .attach('avatar', 'tests/fixtures/profile-pic.jpg')
        .expect(200);
    const user = await User.findById(userOneId);
    expect(user.avatar).toEqual(expect.any(Buffer));
});

test('should update valid user fields', async () => {
    await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            name: 'Luka'
        })
        .expect(200);
    const user = await User.findById(userOneId);
    expect(user.name).toEqual('Luka');
});

test('should not update invalid user fields', async () => {
    await request(app)
    .patch('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({
        location: 'Paris'
    })
    .expect(400);
});

test('should not signup user with invalid name', async () => {
    await request(app)
        .post('/users')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            name: '',
            email: 'test@test.com',
            password: 'testPass123!'
        })
        .expect(400);
});

test('should not signup user with invalid email', async () => {
    await request(app)
        .post('/users')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            name: 'Testko',
            email: 'test@test',
            password: 'testPass123!'
        })
        .expect(400);
});

test('should not signup user with invalid password', async () => {
    await request(app)
        .post('/users')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            name: 'Testko',
            email: 'test@test.com',
            password: '1234'
        })
        .expect(400);
});

test('should not update user if unauthenticated', async () => {
    await request(app)
        .patch('/users/me')
        .send({
            name: 'Mike'
        })
        .expect(401);
    const user = await User.findById(userOneId);
    expect(user.name).not.toBe('Mike');
});

test('should not update user with invalid name', async () => {
    await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            name: ''
        })
        .expect(400);
});

test('should not update user with invalid password', async () => {
    await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            password: 'MyPassword123'
        })
        .expect(400);
});

test('should not update user with invalid email', async () => {
    await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            email: 'test@.com'
        })
        .expect(400);
});

test('should not delete user if unauthenticated', async () => {
    await request(app)
        .delete('/users/me')
        .send()
        .expect(401);
});
