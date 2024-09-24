const mongoose =require('mongoose');

const orderSchema= new mongoose.Schema({
    firstName:{
      type:String
    },
    userEmail:{
      type:String
    },
    totalPrice:{
      type:Number
    },
    productId:[{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'product',
    }]
  })
  
  module.exports=mongoose.model('orderList',orderSchema);