const Tag = require('../models/Tag')

exports.createTag = async (req,res) =>{
    try{

        //fetch data
        const {name,description} = req.body;

        //validate
        if(!name && !description){
            return res.status(403).json({
                success:false,
                message:"All fields are required",
            })
        }

    }catch(error){}
}