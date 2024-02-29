const bcrypt=require('bcrypt');
const nodemailer=require('nodemailer');
const userModel = require('../model/schema');
const  jwt  = require('jsonwebtoken');
const cloudinary = require('cloudinary').v2;




module.exports={
    hash:(password)=>{
      return bcrypt.hashSync(password,10);
    },
    compare:(password,hash)=>{
        return bcrypt.compare(password,hash);
    },

    otpGenration: async()=>{
      const otp = Math.floor(100000+ Math.random() * 900000);
      return otp;
  
   },

   sendMail: async(email,subject,html)=>{
    try {
        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: process.env.MAIL,
              pass: process.env.MAIL_Key
            }
          });
          
          var mailOptions = {
            from: `xxxxx@gmail.com`,
            to: email,
            subject: subject,
            html: html
          };

          transporter.sendMail(mailOptions, function(error, info){
            if (error) {
              console.log(error);
            } else {
              console.log('Email sent: ' + info.response);
            }
          });

    } catch (error) {
        return error;
        
    }
},

verifyToken:async(req,res,next)=>{
  try {
     
    const token = req.cookies.jwt;
    if(!token){
       console.log("Session Expired !!&*");
       return  res.status(440).json("Session Expired");
     }else{

     const decoded=  jwt.verify(token, process.env.SECRET_KEY);

        if(decoded){
              
             const data=await userModel.findOne({ _id:decoded.id });
                  if (!data) {
                      console.log("Unauthorized");
                      return res.status(401).send({ responseCode:401, responseMessage: "Unauthorized" });

                  }
                  else {   
                      req.userId = data._id;
                      next();
                  }
          }
          else{
            console.log("Token Not decoded !!");
           return res.json("Invalid Session Please Login again");
          }
     }
     
  } catch (error) {
    return next(error);
   }
},


          


    
}