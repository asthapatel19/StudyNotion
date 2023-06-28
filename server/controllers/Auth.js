const User = require('../models/User');
const OTP = require("../models/OTP");
const bcrypt = require('bcrypt')
const otpGenerator = require('otp-generator')
const jwt = require('jsonwebtoken')
require('dotenv').config()

//send otp
exports.sendOTP = async (req,res)=>{

    try{
        //fetch email from req body
        const {email} = req.body

        //check if user already exists
        const checkUserPresent = await User.findOne({email});

        //if user exists, return response
        if(checkUserPresent){
            return res.status(401).json({
                success:true,
                message:'User already registered'
            })
        }

        //if does not exists, generate OTP
        var otp = otpGenerator.generate(6,{
            upperCaseAlphabets:false,
            lowerCaseAlphabets:false,
            specialChars:false,
        });

        console.log("OTP Generated",otp)

        //check unique otp or not
        let result = await OTP.findOne({otp:otp});

        while (result) {
			otp = otpGenerator.generate(6, {
				upperCaseAlphabets: false,
			});
		}

        //create otp object and store in DB
        const otpPayload = {email,otp}

        //create an entry in DB for OTP
        const otpBody  = await OTP.create(otpPayload)
        console.log(otpBody)

        //return response
        res.status(200).json({
            success:true,
            message:'OTP Sent Successfully',
            otp,
        })

    }catch(error){
        console.log(error)
        return res.status(500).json({
            success:false,
            message:error.message,
        })
    }
}

//signup
exports.signUp = async (req,res) =>{

    try{

        //fetch data from req body
        const {firstName,lastName,email,password,confirmPassword,accountType,contactNumber,otp} = req.body

        //validate data
        if(!firstName || !lastName || !email || !password || !confirmPassword || !otp){
            return res.status(400).json({
                success:false,
                message:'All fields are required'
            })
        }

        //2 password match
        if(password !== confirmPassword){
            return res.status(400).json({
                success:false,
                message:'Passwords does not match.Please try again'
            })
        }

        //check user already exists or not
        const existingUser = await User.findOne({email})
        if(existingUser){
            return res.status(400).json({
                success:false,
                message:'User is already registered'
            })
        }

        //find most recent OTP for the user
        const recentOtp = await OTP.find({email}).sort({createdAt:-1}).limit(1);
        console.log('Recent otp',recentOtp)

        //validate OTP
        if(recentOtp.length == 0){
            //OTP not found
            return res.status(400).json({
                success:false,
                message:'OTP not found'
            })
        }

        else if(otp !== recentOtp){
            //invalid otp
            return res.status(400).json({
                success:false,
                message:'Invalid OTP'
            })
        }

        //HASH password
        const hashedPassword = await bcrypt.hash(password,10)

        //create profile to add additional entry ref in user schema
        const profileDetails = await Profile.create({
            gender:null,
            dateOfBirth:null,
            about:null,
            contactNumber:null,
        })

        // create entry in DB
        const user = await User.create({
            firstName,
            lastName,
            email,
            contactNumber,
            password,
            accountType,
            password:hashedPassword,
            additionalDetails:profileDetails._id,
            image:`https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
        })

        //return res
        return res.status(200).json({
            success:true,
            message:'User is registered successfully',
            user,

    })

    }catch(error){
        console.log(error)

        return res.status(500).json({
            success:false,
            message:'User cannot be registered. Please try again',
        })
    }
}

//login
exports.logIn = async (req,res) =>{
    
    try{

        //fetch data from req body
        const {email,password} = req.body;
        
        //validate if data entered by user 
        if(!email || !password){
            return res.status(400).json({
                success:false,
                message:'Please fill all the details carefully'
            })
        }

        //check if user exists or registered user
        let user = await User.findOne({email}).populate('additionalDetails');

        //if not registered
        if(!user){
            return res.status(401).json({
                success:false,
                message:'User is not registered. Pls signup first'
            })
        }

        //generate jwt token after matching password
        if(await bcrypt.compare(password,user.password)){
                
            const payload = {
                email : user.email,
                id:user._id,
                accountType:user.accountType,
            }

            const token = jwt.sign(payload,process.env.JWT_SECRET,{
                expiresIn:"2h",
            });

            user.token = token;
            user.password = undefined;
        
            //create cookie
            const options ={
                expires: new Date(Date.now() + 3*24*60*60*1000),
                httpOnly:true,
            }
            res.cookie("token",token,options).status(200).json({
                success:true,
                token,
                user,
                message:'Logged in successfully'
            })
        }

        else{

            return res.status(401).json({
                success:false,
                message:'Password is incorrect'
            })

        }

    }catch(error){
        console.log(error)
        return res.status(500).json({
            success:false,
            message:'Login faliure'
        })
    }

}

//change password - TODO
exports.changePassword  = async(req,res)=>{

    //fetch data from req body

    //get oldPassword, newPassword, confirmNewPassword

    //validation 

    //update password in db if validation success

    //send mail - pwd updated

    //return response
}