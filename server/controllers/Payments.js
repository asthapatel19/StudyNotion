const {instance} = require('../config/razorpay')
const Course = require('../models/Course')
const User = require('../models/User')
const mailSender = require('../utils/mailSender')
const {courseEnrollmentEmail} = require('../mail/templates/courseEnrollmentEmail')
const { default: mongoose } = require('mongoose')

//capture payment and initiate the razorpay order
exports.capturePayment = async(req,res)=>{

    //get course and user id
    const {courseId} = req.body;
    const userId = req.user.id;

    //validate course id
    if(!courseId){
        return res.json({
            success:false,
            message:'Please provide valid course Id',
        })
    }

    //validate courseDetails
    let course;
    try{
        course = await course.findById(courseId)
        if(!course){
            return res.json({
                success:false,
                message:'Could not find the course',
            })
        }
        
        //convert userid which is in string to object id to find in DB
        const uid = new mongoose.Types.ObjectId(userId);
        
        //check if user already paid for the same course
        if(course.studentEnrolled.includes(uid)){
            return res.status(200).json({
                success:false,
                message:'Student is already enrolled',
            })
        }

    }catch(error){
        console.log(error)
        return res.status(500).json({
            success:false,
            message:error.message,
        })
    }
    
    //order create
    const amount = course.price;
    const currency = "INR";

    const options = {
        amount:amount*100,
        currency,
        receipt: Math.random(Date.now()).toString(),
        notes:{
            courseId: course_id,
            userId,
        }
    }

    try{
        //initiate the payment using razorpay
        const paymentResponse = await instance.orders.create(options);
        console.log(paymentResponse)

        //return res with payment details
        return res.status(200).json({
            success:true,
            courseName: course.courseName,
            courseDescription: course.courseDescription,
            thumbnail: course.thumbnail,
            orderId:paymentResponse.id,
            currency:paymentResponse.currency,
            amount:paymentResponse.amount,
        })

    }catch(error){
        console.log(error)
        return res.status(500).json({
            success:false,
            message:'Could not initiate order',
        })
    }   
}

//verify signature of razorpay and server
exports.verifySignature = async(req,res)=>{

    const webhookSecret = "12345678";

    //razorpay activates webhook
    //signature in razorpay sig sent by razorpay -- documentation
    const signature = req.headers["x-razorpay-signature"];

    //to check authenticity of message - sha or hmac 
    //sha - secure hasing algo - through this data can be encrypted - 
    //hmac - hashed based message auth code - combination of hasing algo and secret key
    const shasum = crypto.createHmac("sha256",webhookSecret);

    //convert shasum from object to string
    shasum.update(JSON.stringify(req.body));
    const digest = shasum.digest("hex");

    //match shasum and digest
    if(signature === digest){
        console.log("Payment is authorised")

        //get userid and courseid from notes bcoz this req is from razorpay
        const {courseId, userId} = req.body.payload.entity.notes;

        try{
            //fulfil the action - that is find the course and enroll student in it
            const enrolledCourse = await Course.findOneAndUpdate(
                {_id:courseId},
                {$push:{studentsEnrolled:userId}},
                {new:true},
            )

            if(!enrolledCourse){
                return res.status(500).json({
                    success:false,
                    message:'Course not found',
                })
            }

            console.log(enrolledCourse)

            //find the student and add the course to their list of enrolled courses
            const enrolledStudent = await User.findOneAndUpdate(
                {_id:userId},
                {$push:{courses: courseId}},
                {new:true},
            )

            console.log(enrolledStudent)

            //send confirmation mail - check mailsender parameters in util 
            const emailResponse = await mailSender(
                enrolledStudent.email,
                "Congratulations",
                "You are onboarded into new course"
            )

            console.log(emailResponse)

            return res.status(200).json({
                success:true,
                message:'Signature verified and course added',
            })

        }catch(error){
            console.log(error)
            return res.status(500).json({
                success:false,
                message:error.message,
            })
        }
    }

    //signature not matched
    else{
        return res.status(400).json({
            success:false,
            message:'Invalid signature',
        })
    }
}