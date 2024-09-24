const { mongoose,Schema } = require("mongoose");
const { url } = require("../common/cloudinary");



const userSchema = new Schema({
    name:{
        type:String
    },
    email:{
        type:String
    },
    password:{
        type:String
    },
    isVerifyOtp:{
        type:Boolean,
        default:false
    },
    userType: {
        type: String,
        enum: ['Buyer', 'Seller'],
        default: 'Buyer' 
    },
    photo:{
        type:String,
        default:"https://res.cloudinary.com/do6ufbry5/image/upload/v1693763685/nmovmkbhkwpszrya0vy3.jpg"
    }
},{timestamps:true});



module.exports= mongoose.model("user", userSchema);
