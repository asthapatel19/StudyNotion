const jwt = require("jsonwebtoken")
require("dotenv").config()
const User = require('../models/User')

//auth
exports.auth = async(req,res,next) =>{
    try{

        //verify json token to authenticate user

        //extract token
        const token = req.cookies.token || req.body.token || req.header("Authorisation").replace("Bearer ","")

        //if token missing, return res
        if(!token || token == undefined){
            return res.status(401).json({
                success: false,
                message:"Token missing"
            })
        }

        //verify token using JWT secret key
        try{
            const decode = await jwt.verify(token,process.env.JWT_SECRET)
            console.log(decode)
            req.user = decode

        }catch(err){
            //verification issue
            return res.status(401).json({
                success:false,
                message:"Token is invalid"
            })
        }

        next()

    }catch(error){
        return res.status(401).json({
            success:false,
            message:'Something went wrong while verifying the token'
        })
    }
}

//isStudent - authorization
exports.isStudent = async (req,res,next) => {
    try{
        if(req.user.accountType !== "Student"){
            return res.status(401).json({
                success:false,
                message:"This is a protected route for students only"
            })
        }
        next();

    }catch(error){
        return res.status(500).json({
            success:false,
            message:'User role is not matching'
        })
    }
}

//isInstructor
exports.isInstructor = (req,res,next) => {
    try{

        if(req.user.accountType !== "Instructor"){
            return res.status(401).json({
                success:false,
                message:"This is a protected route for instructors only"
            })
        }
        next();

    }catch(error){
        return res.status(500).json({
            success:false,
            message:'Instructor role is not matching'
        })
    }
}

//isAdmin
exports.isAdmin = (req,res,next) => {
    try{

        if(req.user.accountType !== "Admin"){
            return res.status(401).json({
                success:false,
                message:"This is a protected route for admin only"
            })
        }
        next();

    }catch(error){
        return res.status(500).json({
            success:false,
            message:'Admin role is not matching'
        })
    }
}