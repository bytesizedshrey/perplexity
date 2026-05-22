import express from 'express'
import jwt from 'jsonwebtoken'
import userModel from '../models/user.model.js';

export async function registerUserController(req, res) {
    
    const {username,email,password} = req.body

    const isUserAlreadyExists = await userModel.findOne({
        $or : [{email},{username}]
    })

    if(isUserAlreadyExists){
        return res.status(400)({
            message : 'user already exists with this username or maybe email',
            success : false,
            error : "user already exists"
        })
    }

       
    
}