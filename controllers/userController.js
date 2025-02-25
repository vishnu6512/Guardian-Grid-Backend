const users = require("../models/userModel");
const jwt = require('jsonwebtoken')
const afi = require("../models/requestModel");
//register volunteer
exports.registerVolunteer = async(req,res)=>{
    const {name,email,password,phone,location,role} = req.body
    try{
        const existingVolunteer = await users.findOne({email})
        if(existingVolunteer){
            res.status(406).json("already exisiting volunteer.. please login")
        } else {
            const newVolunteer= new users({
                name, email, password, phone, location, role:"volunteer"
            })
            await newVolunteer.save()
            res.status(201).json(newVolunteer)
        }
    }catch(err){
        res.status(401).json({message:err.message})        
    }
}

//login volunteer
exports.loginVolunteer = async(req,res)=>{
    const {email,password} = req.body
    try{
        const existingVolunteer = await users.findOne({email,password})
        if(existingVolunteer){
            //token generation
            const token = jwt.sign({userId:existingVolunteer._id},process.env.JWTPASSWORD)
            res.status(200).json({user:existingVolunteer,token})
        } else{
            res.status(401).json("Invalid email or password")
        }
    } catch(err){
        res.status(401).json({message:err.message})
    }    
}

//affected individual request
exports.registerAfi = async(req,res)=>{
    const {name,phone,email,location,description,role} = req.body
    try{
        const newAfi = new afi({
            name,phone,email,location,description,role:"AFI",status:"pending"
        })
        await newAfi.save()
        res.status(201).json(newAfi)
    } catch(err){
        res.status(401).json({message:err.message})
    }
}






