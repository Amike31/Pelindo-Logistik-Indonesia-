const { body, validationResult } = require('express-validator');

const validateTask = [
    body('title').notEmpty().withMessage('Title is required'),
    body('status').isIn(['pending', 'completed']).withMessage('Invalid status'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    },
];

const validateTaskUpdate = [
    body('title').optional().notEmpty().withMessage('Title cannot be empty'),
    body('status').optional().isIn(['pending', 'completed']).withMessage('Invalid status'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    },
];

module.exports = { validateTask, validateTaskUpdate };
