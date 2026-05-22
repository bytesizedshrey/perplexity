import express from "express";
import jwt from "jsonwebtoken";
import userModel from "../models/user.model.js";
import { sendEmail } from "../services/mail.service.js";

export async function registerUserController(req, res) {
  const { fullname,username, email, password } = req.body;

  const isUserAlreadyExists = await userModel.findOne({
    $or: [{ email }, { username }],
  });

  if (isUserAlreadyExists) {
    return res.status(400).json({
      message: "user already exists with this username or maybe email",
      success: false,
      error: "user already exists",
    });
  }

  const user = await userModel.create({ fullname,username, email, password });

  await sendEmail({
    to: email,
    subject: "Welcome to Perplexity",
    html: `<p>hey ${user.fullname}, welcome to perplexity ✨</p>
<p>you're officially in. no cap, we're hyped to have you here.</p>
<p>time to unlock some knowledge and slay your curiosity. let's get it 💅</p>
<p>— the perplexity crew</p>`,
  });

res.status(201).json({
    message : "user registered successfully",
    success : true,
    user : {
        id : user._id,
        username : user.username,
        email : user.email
    }
})
}

