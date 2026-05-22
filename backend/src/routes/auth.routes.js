import {Router} from 'express'
import { registerValidator } from '../validator/auth.validator';
import { registerUserController } from '../controllers/auth.controller';

const authRouter = Router()

/**
 * @routes POST /api/auth/register
 * @description Register a new user
 * @access Public
 * @body {username,email,password}
 * @returns {user : {id,username,email},token}
 */
authRouter.post('/register',
    registerValidator, //validator
    registerUserController, //contoller
)

export default authRouter;