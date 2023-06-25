const Course = require('../models/Course')
const Category = require('../models/Category')
const User = require('../models/User')
const {uploadImageToCloudinary} = require('../utils/imageUploader')

//createCourse handler func
exports.createCourse = async (req,res) => {
    try{

        //fetch data
        const {courseName,courseDescription,whatYouWillLearn,price,tag,category,status,instructions}= req.body

        //get thumbnail
        const thumbnail = req.files.thumbnailImage;

        //validation
        if(!courseName || !courseDescription || !whatYouWillLearn || !price || !tag || !category || !thumbnail){
            return res.status(400).json({
                success:false,
                message:'All files are required'
            })
        }

        //check for instructor - DB call -  bcoz instructor objectId required in schema
        
        //stored in payload in auth
        const userId= req.user.id;
        const instructorDetails = await User.findById(userId, {
			accountType: "Instructor",
		});
        console.log('Instructor Details: ',instructorDetails)

        if(!instructorDetails){
            return res.status(404).json({
                success:false,
                message:'Instructor Details Not Found'
            })
        }

        //check given tag is valid or not
        const categoryDetails = await Category.findById(category)
        if(!categoryDetails){
            return res.status(404).json({
                success:false,
                message:'Tag Details Not Found'
            })
        }

        //upload image to cloudinary
        const thumbnailImage = await uploadImageToCloudinary(thumbnail,process.env.FOLDER_NAME);
        console.log(thumbnailImage)

        //create an entry for new course
        const newCourse = await Course.create({
            courseName,
            courseDescription,
            instructor: instructorDetails._id,
            whatYouWillLearn:whatYouWillLearn,
            price,
            tag:tag,
            category:categoryDetails._id,
            thumbnail:thumbnailImage.secure_url,
            status:status,
            instructions:instructions,
        })

        //update user -- instructor -- in instructor course list
        //add the new course in user schema for instructor
        await User.findByIdAndUpdate(
            {_id:instructorDetails._id},
            {
                $push:{
                    courses: newCourse._id,
                }
            },
            {new:true},
        )

        //update category schema - add new course id to it
        await Category.findByIdAndUpdate(
            {_id:category},
            {
                $push:{
                    course:newCourse._id,
                }
            },
            {new:true}
        )

        return res.status(200).json({
            success:true,
            message:'Course created successfully',
            data:newCourse,
        })
        
    }catch(error){
        console.log(error)
        return res.status(500).json({
            success:false,
            message:'Error in creating course',
            error:error.message,
        })

    }
}

//getAllCourses
exports.getAllCourses = async (req,res) =>{
    try{

        const allCourses = await Course.find({},{courseName:true,
                                                 price:true,
                                                 thumbnail:true,
                                                 instructor:true,
                                                 ratingAndReviews:true,
                                                 studentsEnrolled:trye,
                                                })
                                                 .populate("instructor")
                                                 .exec();

        return res.status(200).json({
            success:true,
            message:'Data for all courses fetch successfully',
            data:allCourses,
        })

    }catch(error){
        console.log(error)
        return res.status(500).json({
            success:false,
            message:'Cannot fetch course data',
            error:error.message,
        })
    }
}

//get Course Details
exports.getCourseDetails = async (req,res)=>{
    try{
        //get courseId
        const {courseId} = req.body;

        //find course details
        const courseDetails = await Course.find({_id:courseId})
        .populate(
            {
                path:"instructor",
                populate:{
                    path:"additionalDetails",
                },
            })
            .populate("category")
            .populate("ratingAndreviews")
            .populate({
                path:"courseContent",
                populate:{
                    path:"subSection",
                },
            })
            .exec();

        //validate
        if(!courseDetails){
            return res.status(400).json({
                success:false,
                message:`Could not find the course with ${courseId}`,
            })
        }

        //return res
        return res.status(200).json({
            success:true,
            message:"Course details fetched successfully",
            data:courseDetails
        })

    }catch(error){
        console.log(error)
        return res.status(500).json({
            success:false,
            message:error.message,
        })
    }
}