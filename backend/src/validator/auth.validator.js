import {body} from 'express-validator'
import { validator } from '../middlewares/validator.middleware.js';

export const registerValidator = [
    body('fullname')
    .trim()
    .notEmpty()
    .withMessage('fullname is required')
    .isLength({min : 3})
    .withMessage('fullName must be atleast 3 characters'),

    body('username')
    .trim()
    .notEmpty()
    .withMessage('username is required')
    .isLength({min : 3})
    .withMessage('username must be atleast 3 characters')
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('username can only contain letters, numbers, underscores and hyphens'),

    body('email')
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage('Invalid email format')
    .normalizeEmail(),

    body('password')
    .trim()
    .notEmpty()
    .withMessage('password is required')
    .isLength({min : 6})
    .withMessage('password must be atleast 6 characters'),

    validator
]

export const loginValidator = [
    body("email")
    .trim()
    .notEmpty().withMessage("Email is required")
    .isEmail().withMessage("Please provide a valid email"),

    body("password")
    .notEmpty().withMessage('password is required'),

    validator
]