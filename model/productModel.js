const { mongoose,Schema } = require("mongoose");
const paginate = require('mongoose-paginate-v2');


const productModel=new Schema({

    name:{
        type:String
    },
    description:{
        type:String
    },
    price:{
        type:Number
    },
    image:{
        type:String
    },
    quantity:{
        type:Number
    }

},{timestamps:true});

productModel.plugin(paginate);

module.exports= mongoose.model('product',productModel);