const Profile = require('../models/Profile')
const User = require('../models/User')

exports.updateProfile = async (req,res)=>{
    try{

        //get data
        const {dateOfBirth='',about='',contactNumber,gender}=req.body;

        //get userId- from auth js middleware - decode token
        const id = req.user.id;

        //validate
        if(!contactNumber || !gender || !id){
            return res.status(400).json({
                success:false,
                message:'All fields are required'
            })
        }

        //find profile id from user id
        const userDetails = await User.findById(id)
        const profileId = userDetails.additionalDetails;
        const profileDetails = await Profile.findById(profileId)

        //update profile
        profileDetails.dateOfBirth = dateOfBirth;
        profileDetails.about = about;
        profileDetails.gender = gender;
        profileDetails.contactNumber = contactNumber;

        await profileDetails.save()

        //return response
        return res.status(200).json({
            success:true,
            message:'Profile details updated successfully',
            profileDetails,
        })

    }catch(error){
        console.log(error)
        return res.status(500).json({
            success:false,
            message:'Error in updating profile',
            error:error.message,
        })
    }
}

//how to schedule this delete operation??
exports.deleteAccount = async (req,res) =>{
    try{

        //get id
        const id = req.user.id;

        //validate id
        const userDetails = await User.findById(id)
        if(!userDetails){
            return res.status(404).json({
                success:false,
                message:'User not found',
            })
        }

        //delete profile
        await Profile.findByIdAndDelete({_id:userDetails.additionalDetails})

        //delete user
        await User.findByIdAndDelete({_id:id});

        //return res
        return res.status(200).json({
            success:true,
            message:'User deleted successfully',
        })

    }catch(error){
        console.log(error)
        return res.status(500).json({
            success:false,
            message:'User cannot be deleted',
            error:error.message,
        })
    }
}

exports.getAllUserDetails = async(req,res)=>{
    try{

        //get id
        const id = req.user.id;

        //get userDetails
        const userDetails = await User.findById(id).populate("additionalDetails").exec();

        //return res
        return res.status(200).json({
            success:true,
            message:'User details fetched successfully',
        })


    }catch(error){
        return res.status(500).json({
            success:false,
            message:'Error in fetching user details',
            error:error.message,
        })
    }
}