import { Router } from "express";
import { registerValidator, loginValidator } from "../validator/auth.validator.js";
import {
  registerUserController,
  verifyEmailController,
  loginUserController,
  getMeController

} from "../controllers/auth.controller.js";
import { authUser } from "../middlewares/auth.middleware.js";


const authRouter = Router();

/**
 * @routes POST /api/auth/register
 * @description Register a new user
 * @access Public
 * @body {username,email,password}
 * @returns {user : {id,username,email},token}
 */
authRouter.post(
  "/register",
  registerValidator, //validator
  registerUserController, //contoller
);

/**
 * @routes POST /api/auth/login
 * @description Login user
 * @access Public
 * @body {email,password}
 */
authRouter.post('/login',
    loginValidator,
    loginUserController)

 /**
 * @routes POST /api/auth/get-me
 * @description get current logged in user's details
 * @access Private
 */
authRouter.post('/get-me',authUser,getMeController)

/**
 * @routes POST /api/auth/verify-email
 * @description verify email
 * @access Public
 * @query {token}
 */
authRouter.get("/verify-email", verifyEmailController);

export default authRouter;
