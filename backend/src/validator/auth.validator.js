import {body} from 'express-validator'
import { validator } from '../middlewares/validator.middleware';

export const registerValidator = [
    body('fullname')
    .trim()
    .notEmpty()
    .withMessage('fullname is required')
    .isLength({min : 3})
    .withMessage('fullName must be atleast 3 characters')
    .matches(/^[a-zA-Z\-]+$/).withMessage('username can only contain letters,numbers and underscores')
    ,

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