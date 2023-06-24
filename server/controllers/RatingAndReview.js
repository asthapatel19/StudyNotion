const RatingAndReview = require("../models/RatingAndReview")
const Course = require('../models/Course');
const { default: mongoose } = require("mongoose");

//create Rating
exports.createRating = async(req,res)=>{
    try{
        //get userid
        const userId = req.user.id;
        //fetch data
        const {rating,review,courseId} = req.body;
        //check if user is enrolled or not
        const courseDetails = await Course.findOne(
            {_id:courseId,
            studentsEnrolled:{$elemMatch:{$eq:userId}},
        })

        if(!courseDetails){
            return res.status(404).json({
                success:false,
                message:'Student is not enrolled in the course',
            })
        }

        //check if user already reviewed the course
        const alreadyReviewed = await RatingAndReview.findOne({
            user:userId,
            course:courseId,
        })

        if(alreadyReviewed){
            return res.status(403).json({
                success:false,
                message:'You have already reviewed this course',
            })
        }

        //create rating  and review
        const ratingReview = await RatingAndReview.create({
            rating,
            review,
            course:courseId,
            user:userId,
        })

        //update course with this rating and review
        const updatedCourseDetails = await Course.findByIdAndUpdate({_id:courseId},
            {
                $push:{
                    ratingAndReviews:ratingReview._id,
                }
            },
            {new:true})

        console.log(updatedCourseDetails)

        //return res
        return res.status(200).json({
            success:true,
            message:'Rating and Review added successfully',
            ratingReview,
        })

    }catch(error){
        console.log(error)
        return res.status(500).json({
            success:false,
            message:error.message,
        })
    }
}

//get avg rating
exports.getAverageRating = async(req,res)=>{
    try{
        //get courseId
        const {courseId} = req.body.courseId;

        //calc avg rating
        const result = await RatingAndReview.aggregate([
            {
                //match entry in which course key has courseid -- string converted to object id
                $match:{
                    course: new mongoose.Types.ObjectId(courseId)
                }
            },
            {
                $group:{
                    //all entries are wrapped in a single grp
                    _id:null,
                    averageRating:{ $avg: "$rating"},
                }
            }
        ])

        //return rating
        if(result.length>0){
            return res.status(200).json({
                success:true,
                //bcoz result is an array
                averageRating:result[0].averageRating,
            })
        }

        //if no rating review exist
        return res.status(200).json({
            success:true,
            message:'Average Rating is 0, no ratings given till now',
            averageRating:0,
        })

    }catch(error){
        console.log(error)
        return res.status(500).json({
            success:false,
            message:error.message,
        })
    }
}

//get all ratings
exports.allRatings = async(req,res)=>{
    try{

    }catch(error){
        console.log(error)
        return res.status(500).json({
            success:false,
            message:error.message,
        })
    }
}