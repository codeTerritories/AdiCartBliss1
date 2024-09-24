const mongoose =require('mongoose');

const cartModel = new mongoose.Schema({
   
    userId:{
        type:String
     },
    productId: {
       _id: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'product'
        }],
    },
})

module.exports= mongoose.model("cartModel", cartModel);
