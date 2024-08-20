const connect = require('./db');
const oracledb = require('oracledb');

async function createTask(req, res) {
    const { title, description, status } = req.body;
    try {
        const connection = await connect();
        const result = await connection.execute(
            `INSERT INTO tasks (title, description, status) VALUES (:title, :description, :status) RETURNING id INTO :id`,
            { title, description, status, id: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT } },
            { autoCommit: true }
        );
        console.log('Task created with ID:', result.outBinds.id[0]);
        res.status(201).json({ message: 'Task created successfully', task: { id: result.outBinds.id[0], title, description, status } });
    } catch (err) {
        res.status(500).json({ message: 'Error creating task', error: err.message });
    }
}

async function getAllTasks(req, res) {
    try {
        const connection = await connect();
        const result = await connection.execute(`SELECT * FROM tasks`);
        const columnNames = ['id', 'title', 'description', 'status'];
        const tasks = result.rows.map(row => {
            let taskObject = {};
            columnNames.forEach((colName, index) => {
                taskObject[colName] = row[index];
            });
            return taskObject;
        });
        res.status(200).json(tasks);
    } catch (err) {
        res.status(500).json({ message: 'Error retrieving tasks', error: err.message });
    }
}

async function getTaskById(req, res) {
    const { id } = req.params;
    try {
        const connection = await connect();
        const result = await connection.execute(`SELECT * FROM tasks WHERE id = :id`, [id]);
        if (result.rows.length === 0) {
            console.log('Task not found');
            return res.status(404).json({ message: 'Task not found' });
        }
        const columnNames = ['id', 'title', 'description', 'status'];
        const task = result.rows[0];
        let taskObject = {};
        columnNames.forEach((colName, index) => {
            taskObject[colName] = task[index];
        });
        res.status(200).json(taskObject);
    } catch (err) {
        res.status(500).json({ message: 'Error retrieving task', error: err.message });
    }
}

async function updateTask(req, res) {
    const { id } = req.params;
    const { title, description, status } = req.body;
    try {
        const connection = await connect();
        const result = await connection.execute(
            `UPDATE tasks SET title = :title, description = :description, status = :status WHERE id = :id`,
            { id, title, description, status },
            { autoCommit: true }
        );
        if (result.rowsAffected === 0) {
            console.log('Task not found');
            return res.status(404).json({ message: 'Task not found' });
        }
        console.log('Task updated: with ID:', id);
        res.status(200).json({ message: 'Task updated successfully', task: { id, title, description, status } });
    } catch (err) {
        res.status(500).json({ message: 'Error updating task', error: err.message });
    }
}

async function deleteTask(req, res) {
    const { id } = req.params;
    try {
        const connection = await connect();
        const result = await connection.execute(`DELETE FROM tasks WHERE id = :id`, [id], { autoCommit: true });
        if (result.rowsAffected === 0) {
            console.log('Task not found');
            return res.status(404).json({ message: 'Task not found' });
        }
        console.log('Task deleted with ID:', id);
        res.status(200).json({ message: 'Task deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting task', error: err.message });
    }
}

// test oracle connection
async function testConnection(req, res) {
    try {
        const connection = await connect();
        console.log('Oracle connection successful');
        res.status(200).json({ message: 'Oracle connection successful' });
    } catch (err) {
        res.status(500).json({ message: 'Oracle connection failed', error: err.message });
    }
}

// create tasks table, but only if it doesn't exist
async function createTable(req, res) {
    try {
        const connection = await connect();
        await connection.execute(
            `CREATE TABLE tasks (
                id NUMBER GENERATED BY DEFAULT ON NULL AS IDENTITY PRIMARY KEY,
                title VARCHAR2(255) NOT NULL,
                description VARCHAR2(255),
                status VARCHAR2(50) NOT NULL CHECK (status IN ('pending', 'completed'))
            )`
        );
        console.log('Table created');
        res.status(201).json({ message: 'Table created successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Error creating table', error: err.message });
    }
}

module.exports = { createTask, getAllTasks, getTaskById, updateTask, deleteTask, testConnection, createTable };
