const request = require('supertest');
const app = require('../src/app');
const Task = require('../src/models/task');
const { setupDatabase, userOne, userTwo, taskOne } = require('./fixtures/db');

beforeEach(setupDatabase);

test('should create task for user', async () => {
    const response = await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            description: 'Smoke a joint'
        })
        .expect(201);
    const task = await Task.findById(response.body._id);
    expect(task).not.toBeNull();
    expect(task.completed).not.toBeTruthy();
});

test('should fetch user tasks', async () => {
    const response = await request(app)
        .get('/tasks')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200);
    expect(response.body.length).toBe(2);
});

test('should not delete task by other user', async () => {
    await request(app)
        .delete(`/tasks/${taskOne._id}`)
        .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
        .send()
        .expect(404);
    const task = await Task.findById(taskOne._id);
    expect(task).not.toBeNull();
});

test('should not crete task with invalid description', async () => {
    await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            description: ''
        })
        .expect(400);
});

test('should not crete task with invalid completed', async () => {
    await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            description: 'Eat a banana',
            completed: 'banana'
        })
        .expect(400);
});

test('should not update task with invalid completed', async () => {
    await request(app)
        .patch(`/tasks/${taskOne._id}`)
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            completed: 'banana'
        })
        .expect(400);
});

test('should not update task with invalid description', async () => {
    await request(app)
        .patch(`/tasks/${taskOne._id}`)
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            description: ''
        })
        .expect(400);
});

test('should delete user task', async () => {
    await request(app)
        .delete(`/tasks/${taskOne._id}`)
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200);
    const task = await Task.findById(taskOne._id);
    expect(task).toBeNull();
});

test('should not delete user task if unauthenticated', async () => {
    await request(app)
        .delete(`/tasks/${taskOne._id}`)
        .send()
        .expect(401);
    const task = await Task.findById(taskOne._id);
    expect(task).not.toBeNull();
});

test('should not update other users tasks', async () => {
    await request(app)
        .patch(`/tasks/${taskOne._id}`)
        .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
        .send({
            description: 'Read a book'
        })
        .expect(404);
    const task = await Task.findById(taskOne._id);
    expect(task.description).not.toBe('Read a book');
});

test('should fetch user task by id', async () => {
    const response = await request(app)
        .get(`/tasks/${taskOne._id}`)
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200);
    expect(response.description).toEqual(userOne.description);
});

test('should not fetch user task by id if unauthenticated', async () => {
    const response = await request(app)
        .get(`/tasks/${taskOne._id}`)
        .send()
        .expect(401);
});

test('should not fetch other users tasks by id', async () => {
    await request(app)
        .get(`/tasks/${taskOne._id}`)
        .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
        .send()
        .expect(404);
});

test('should fetch only completed tasks', async () => {
    const response = await request(app)
        .get('/tasks?completed=true')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200);
    expect(response.body.length).toBe(1);
});

test('should fetch only incomplete tasks', async () => {
    const response = await request(app)
        .get('/tasks?completed=false')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200);
    expect(response.body.length).toBe(1);
});

test('should fetch page of tasks', async () => {
    const response = await request(app)
        .get('/tasks?skip=1')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200);
        expect(response.body.length).toBe(1);
})
