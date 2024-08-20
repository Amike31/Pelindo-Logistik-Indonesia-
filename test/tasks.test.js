const request = require('supertest');
const express = require('express');
const routes = require('../src/routes');

const app = express();
app.use(express.json());
app.use('/tasks', routes);

describe('Task API', () => {
    // Success Tests
    it('should create a task', async () => {
        const res = await request(app)
            .post('/tasks/create')
            .send({ title: 'Test Task', description: 'Test Description', status: 'pending' });
        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('message', 'Task created successfully');
        expect(res.body.task).toHaveProperty('id');
    });

    it('should get all tasks', async () => {
        const res = await request(app).get('/tasks/getAll');
        expect(res.statusCode).toEqual(200);
        expect(res.body).toBeInstanceOf(Array);
        if (res.body.length > 0) {
            const task = res.body[0];
            expect(task).toHaveProperty('id');
            expect(task).toHaveProperty('title');
            expect(task).toHaveProperty('description');
            expect(task).toHaveProperty('status');
        }
    });

    it('should get a task by ID', async () => {
        const createRes = await request(app)
            .post('/tasks/create')
            .send({ title: 'Task to Get', description: 'Description', status: 'pending' });
        const taskId = createRes.body.task.id;
        const res = await request(app).get(`/tasks/getById/${taskId}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('id');
        expect(res.body).toHaveProperty('title', 'Task to Get');
        expect(res.body).toHaveProperty('description', 'Description');
        expect(res.body).toHaveProperty('status', 'pending');
    });

    it('should update a task', async () => {
        const createRes = await request(app)
            .post('/tasks/create')
            .send({ title: 'Task to Update', description: 'Description', status: 'pending' });
        const taskId = createRes.body.task.id;
        const res = await request(app)
            .patch(`/tasks/update/${taskId}`)
            .send({ title: 'Updated Task', description: 'Updated Description', status: 'completed' });
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('message', 'Task updated successfully');
    });

    it('should delete a task', async () => {
        const createRes = await request(app)
            .post('/tasks/create')
            .send({ title: 'Task to Delete', description: 'Description', status: 'pending' });
        const taskId = createRes.body.task.id;
        const res = await request(app).delete(`/tasks/delete/${taskId}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('message', 'Task deleted successfully');
    });

    // Failure Tests
    it('should return 400 if title is missing when creating a task', async () => {
        const res = await request(app)
            .post('/tasks/create')
            .send({ description: 'Description', status: 'pending' });
        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty('errors');
        expect(res.body.errors[0]).toHaveProperty('msg', 'Title is required');
    });

    it('should return 400 if status is invalid when creating a task', async () => {
        const res = await request(app)
            .post('/tasks/create')
            .send({ title: 'Task', description: 'Description', status: 'invalid' });
        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty('errors');
        expect(res.body.errors[0]).toHaveProperty('msg', 'Invalid status');
    });

    it('should return 404 if task ID does not exist when getting a task by ID', async () => {
        const res = await request(app).get('/tasks/getById/99999');
        expect(res.statusCode).toEqual(404);
        expect(res.body).toHaveProperty('message', 'Task not found');
    });

    it('should return 404 if task ID does not exist when updating a task', async () => {
        const res = await request(app)
            .patch('/tasks/update/99999')
            .send({ title: 'Updated Task', description: 'Updated Description', status: 'completed' });
        expect(res.statusCode).toEqual(404);
        expect(res.body).toHaveProperty('message', 'Task not found');
    });

    it('should return 404 if task ID does not exist when deleting a task', async () => {
        const res = await request(app).delete('/tasks/delete/99999');
        expect(res.statusCode).toEqual(404);
        expect(res.body).toHaveProperty('message', 'Task not found');
    });

    it('should return 400 if title is empty when updating a task', async () => {
        const createRes = await request(app)
            .post('/tasks/create')
            .send({ title: 'Task to Update', description: 'Description', status: 'pending' });
        const taskId = createRes.body.task.id;
        const res = await request(app)
            .patch(`/tasks/update/${taskId}`)
            .send({ title: '', description: 'Updated Description', status: 'completed' });
        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty('errors');
        expect(res.body.errors[0]).toHaveProperty('msg', 'Title cannot be empty');
    });

    it('should return 400 if status is invalid when updating a task', async () => {
        const createRes = await request(app)
            .post('/tasks/create')
            .send({ title: 'Task to Update', description: 'Description', status: 'pending' });
        const taskId = createRes.body.task.id;
        const res = await request(app)
            .patch(`/tasks/update/${taskId}`)
            .send({ title: 'Updated Task', description: 'Updated Description', status: 'invalid' });
        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty('errors');
        expect(res.body.errors[0]).toHaveProperty('msg', 'Invalid status');
    });
});
