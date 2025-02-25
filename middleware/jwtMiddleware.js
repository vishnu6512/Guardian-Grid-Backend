const jwt=require("jsonwebtoken")
const jwtMiddleware=(req,res,next)=>{
    const token = req.header['authorization'].split(" ")[1]
    if(token!=''){
        try{
            const jwtResponse = jwt.verify(token, process.env.JWTPASSWORD)
            req.userId=jwtResponse.userId
            next()
        }catch(err){
            console.log(err);
            res.status(401).json({message:"Authorization failed due to invalid token"})
            
        }
    }
}
module.exports= jwtMiddleware