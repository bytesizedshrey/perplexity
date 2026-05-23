import express from "express";
import jwt from "jsonwebtoken";
import userModel from "../models/user.model.js";
import { sendEmail } from "../services/mail.service.js";

export async function registerUserController(req, res) {
  try {
    const { fullname, username, email, password } = req.body;

    const isUserAlreadyExists = await userModel.findOne({
      $or: [{ email }, { username }],
    });

    if (isUserAlreadyExists) {
      return res.status(400).json({
        message: "User already exists with this username or email",
        success: false,
      });
    }

    const user = await userModel.create({
      fullname,
      username,
      email,
      password,
    });

    const emailVerificationToken = jwt.sign(
      {
        email: user.email,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    await sendEmail({
      to: email,
      subject: "Welcome to Perplexity",
      html: `
      <p>Hey ${user.fullname}, welcome to Perplexity ✨</p>
      <p>You're officially in.</p>

      <p>Verify your email:</p>

      <a href="http://localhost:3000/api/auth/verify-email?token=${emailVerificationToken}">
        Verify Email
      </a>
      `,
    });

    res.status(201).json({
      message: "User registered successfully",
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function loginUserController(req,res) {
  const {email,password} = req.body

  const user = await userModel.findOne({email})

  if(!user){
    return res.status(400).json({
      message : 'Invalid email or password',
      success : false,
      err : "User Not Found..."
    })
  }

  const isPasswordMatch = await user.comparePassword(password)

  if(!isPasswordMatch){
    return res.status(400).json({
      message : "invalid email or password",
      success : false,
      err : 'Incorrect password'
    })
  }

  if(!user.verified){
    return res.status(400).json({
      message:"Please verify your email before login.",
      success : false,
      err : "Email not found"
    })
  }

  const token = jwt.sign({
    id : user._id,
    username : user.username,
  },process.env.JWT_SECRET,{expiresIn: '7d'})

  res.cookie("token",token)

  res.status(200).json({
    message : "Login Successful",
    success : true,
    user:{
      id : user._id,
      username : user.username,
      email : user.email
    }
  })
}

export async function getMeController(req,res) {
  const userId = req.user.id

  const user = await userModel.findById(userId).select("-password")

  if(!user){
    return res.status(404).json({
      message : "User not Found",
      success : false,
      err : "User Not Found"
    })
  }

  res.status(200).json({
    message : "User details fetched successfully",
    success : true,
    user
  })


}

export async function verifyEmailController(req, res) {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({
        message: "Token missing",
        success: false,
      });
    }

    // Decode token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    // Find user
    const user = await userModel.findOne({
      email: decoded.email,
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid token",
        success: false,
      });
    }

    // Already verified check
    if (user.verified) {
      return res.send(`
        <h1>Email Already Verified</h1>
        <p>You can login now.</p>
      `);
    }

    // Verify user
    user.verified = true;
    await user.save();

    res.send(`
      <h1>Email Verified Successfully.</h1>
      <p>Your email has been verified. You can now log in.</p>
      <a href="http://localhost:3000/login">Go To Login</a>
    `);
  } catch (error) {
    console.log(error);

    return res.status(400).json({
      message: "Invalid or expired token",
      success: false,
    });
  }
}