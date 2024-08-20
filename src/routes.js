const express = require('express');
const { createTask, getAllTasks, getTaskById, updateTask, deleteTask, createTable, testConnection } = require('./controllers');
const { validateTask, validateTaskUpdate } = require('./validators');

const router = express.Router();

// TASKS
router.post('/create', validateTask, createTask);
router.get('/getAll', getAllTasks);
router.get('/getById/:id', getTaskById);
router.patch('/update/:id', validateTaskUpdate, updateTask);
router.delete('/delete/:id', deleteTask);

// INIT
router.get('/testConnection', testConnection);
router.get('/createTable', createTable);

module.exports = router;
