const Section = require('../models/Section')
const Course = require('../models/Course')

exports.createSection = async(req,res) =>{
    try{

        //fetch data
        const {sectionName,courseId} = req.body;

        //validation
        if(!sectionName || !courseId){
            return res.status(400).json({
                success:false,
                message:'Missing Properties',
            })
        }

        //create section
        const newSection = await Section.create({sectionName})

        //update section object id in course schema
        const updatedCourseDetails = await Course.findByIdAndUpdate(
            courseId,
            {
                $push:{
                    courseContent:newSection._id,

                }
            },
            {new:true},
        )

        //populate to replace section/subsection both in updateCourseDetails
        //return res
        return res.status(200).json({
            success:true,
            message:'Section created successfully'
        })

    }catch(error){
        console.log(error)
        return res.status(500).json({
            success:false,
            message:'Something went wrong while creating a section'
        })
    }
}

exports.updateSection = async (req,res) =>{
    try{
        //data input
        const {sectionName,sectionId} = req.body

        //data validation
        if(!sectionName || !sectionId){
            return res.status(400).json({
                success:false,
                message:'Missing Properties',
            })
        }

        //update data
        const section = await Section.findByIdAndUpdate(sectionId, {sectionName},{new:true});

        //return response
        return res.status(200).json({
            success:true,
            message:'Section updated successfully'
        })

    }catch(error){
        console.log(error)
        return res.status(500).json({
            success:false,
            message:'Unable to update section,pls try again'
        })
    }
}

exports.deleteSection = async(req,res)=>{
    try{

        //get sectionId - id in params
        const {sectionId} = req.params;

        //findbyid and delete
        await Section.findByIdAndDelete(sectionId);

        //TODO: test - delete the entry from course schema??

        //return res
        return res.status(200).json({
            success:true,
            message:'Section Deleted Successfully'
        })

    }catch(error){
        console.log(error)
        return res.status(500).json({
            success:false,
            message:'Unable to delete section, pls try again'
        })
    }
}