import { Router } from "express";
import { registerValidator, loginValidator } from "../validator/auth.validator.js";
import {
  registerUserController,
  verifyEmailController,
  loginUserController

} from "../controllers/auth.controller.js";

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
 * @routes POST /api/auth/verify-email
 * @description verify email
 * @access Public
 * @query {token}
 */
authRouter.get("/verify-email", verifyEmailController);

export default authRouter;
