const Section = require('../models/Section')
const SubSection = require('../models/SubSection');
const { uploadImageToCloudinary } = require('../utils/imageUploader');

exports.createSubSection = async(req,res) =>{
    try{

        //fetch data
        const {sectionId,title,timeDuration,description} = req.body;

        //extract video file
        const video = req.files.videoFile;

        //validation
        if(!sectionId || !title || !timeDuration || !description || !video){
            return res.status(400).json({
                success:false,
                message:'All fields are required',
            })
        }

        //upload video to cloudinary and fetch secure url
        const uploadDetails = await uploadImageToCloudinary(video,process.env.FOLDER_NAME)

        //create subsection
        const subSectionDetails = await SubSection.create({
            title:title,
            timeDuration:timeDuration,
            description:description,
            videoUrl:uploadDetails.secure_url,
        })

        //update subsection in section schema
        const updatedSection = await Section.findByIdAndUpdate(
            {_id:sectionId},
            {
                $push:{
                    subSection:subSectionDetails._id,

                }
            },
            {new:true},
        )

        //TODO: log updated section here after adding populate query

        //return res
        return res.status(200).json({
            success:true,
            message:'SubSection created successfully'
        })

    }catch(error){
        console.log(error)
        return res.status(500).json({
            success:false,
            message:'Internal server error',
            error:error,
        })
    }
}