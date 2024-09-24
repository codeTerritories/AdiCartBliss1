const userModel = require('../model/schema');
const commonFunction = require('../common/commonFunction');
// const { cloudinary } = require('../common/cloudinary');
const jwt = require('jsonwebtoken');
const productModel = require('../model/productModel');
const cartModel = require('../model/cart');
const orderModel = require('../model/orderSchema');
const Stripe = require('stripe');
const { model } = require('mongoose');
const stripe = new Stripe(process.env.STRIPE_KEY);
const cloudinary = require('cloudinary').v2;

const Fuse = require('fuse.js');


const fuseOptions = {
  keys: ['name'], // Specify the field(s) to search within
};





module.exports = {

  // ********SignUp************
  signUp: async (req, res, next) => {
    try {
      let message = "";
      const { name, email, password, userType } = req.body;
      console.log(userType);
      const user = await userModel.findOne({ email: email });
      if (user) {
        message = "Email already exist !!";
      }
      else {
        // Generate OTP....
        const otp = await commonFunction.otpGenration();

        // time of OTP creation
        let currrentTime = +new Date();
        req.body.otpTime = currrentTime;

        // Password Hashing...
        req.body.password = commonFunction.hash(password);

        // Create user in database....
        const data = await userModel.create(req.body);

        // Create email link to send for verification
        const baseURL = 'http://localhost:4000/verifyEmail/';
        const verificationLink = `${baseURL}${encodeURIComponent(email)}`;
        const emailTemplate = `
                                <h1>Email Verification</h1>
                                <p>Click the following link to verify your email:</p>
                                <a href="${verificationLink}">Click here</a>
                              `;

        // Send Email to verify email...
        await commonFunction.sendMail(email, "Email VERIFICATION", emailTemplate);

        if (data) {
          message = "Registration Successfull !! Please check your Email ..";
        }
        else {
          message = "Something Went wrong !!";
        }
      }

      res.render('registrationResult', { message });

    } catch (error) {
      return next(error);
    }
  },

  // ******verify Email*********
  verifyEmail: async (req, res, next) => {
    try {

      console.log("!!!!!!-->", req.params.email)
      const email = decodeURIComponent(req.params.email);
      const result = await userModel.findOne({ email: email });
      if (!result) {
        return res.send("Some thing went wrong");
      }
      else {

        const result = await userModel.updateOne({ email: email }, { $set: { isVerifyOtp: true } });

        if (!result) {
          return res.status(500).send("Internal Server Error !!");
        } else {
          console.log("isoptverify: true");
          res.send("Email Verification Success");
        }

      }
      console.log(result)
      console.log("Verification success!!")
      return res.send('Verification Successful');

    } catch (error) {
      console.log("!!!!!");
      return next(error);
    }
  },


  // *******Login **********
  logIn: async (req, res, next) => {
    try {
      // user Data....
      const data = await userModel.findOne({ email: req.body.email });
      if (!data) {
        console.log("Email not found");
        return res.send("Email not found");
      }
      else if (data.isVerifyOtp == true) {

        const isPass = await commonFunction.compare(req.body.password, data.password);
        console.log(isPass);
        if (isPass) {
          // payload for jwt
          const payload = {
            email: data.email,
            id: data._id,
          };
          const token = jwt.sign(payload, process.env.SECRET_KEY, { expiresIn: "2h" });
          console.log(token);
          console.log("login success...");
          res.cookie('jwt', token, { httpOnly: true, maxAge: 7200000 });
          res.render('userProfile');
        }
        else {
          return res.status(401).send({ responseCode: 401, responseMessage: "Password did not match" })
        }

      }
      else {
        return res.status(404).send("Email not Verified !!");

      }
    } catch (error) {
      return res.status(501).send({ resposneMessage: "Server Error !!", responseCode: 501 });
    }
  },

  // ********User Profile******
  profile: async (req, res, next) => {
    try {
      const user = await userModel.findById({ _id: req.userId });
      if (user) {
        return res.status(200).json(user);
      } else {
        return res.status(440).json("Session Expired !!");
      }
    } catch (error) {
      return next(error);
    }
  },


  // *********Edit-Profile***********
  editProfile: async (req, res, next) => {
    try {
      console.log("*********");
      const formData = req.body;
      // const image=req.files.image;

      if (!req.userId) {
        return res.status(401).send({ message: "Unauthorized" });
      }
      if (formData.password) {
        if (formData.password !== '') {
          console.log("Password detected !!");
          formData.password = commonFunction.hash(formData.password);

          if (formData.name) {
            const result = await userModel.findOneAndUpdate({ _id: req.userId },{ $set: formData },{ new: true });
            console.log(result);
          } else {
            const result = await userModel.findOneAndUpdate({ _id: req.userId }, { $set: { password: formData.password } }, { new: true });
            console.log(result);
            return res.status(200).send({ message: "Password update Successful" });
          }
        }
      } else if(req.files != null) {
        console.log("From image section !!!!!!!!");
        
        console.log( process.env.CLOUDE_NAME);
        console.log(process.env.API_KEY);
        console.log(process.env.SECRET);
        cloudinary.config({
          cloud_name: process.env.CLOUDE_NAME,
          api_key: process.env.API_KEY,
          api_secret: process.env.SECRET  
        });

        const result = await cloudinary.uploader.upload(req.files.image.tempFilePath);
        console.log("result:- ",result);
        const imageUrl = result.secure_url;
        console.log('Image URL:', imageUrl);
        const updated = await userModel.findOneAndUpdate({ _id: req.userId }, { $set: { photo: result.url } }, { new: true });
        console.log(updated)
        return res.status(200).send({ message: "Successful" });
        
         
      }else if (formData.name) {
        // Handle name update only
        const result = await userModel.findOneAndUpdate(
          { _id: req.userId },
          { $set: { name: formData.name } },
          { new: true }
        );
        console.log(result);
        return res.status(200).send({ message: "Successful" });
      } else {
        // No password, no image, and no name provided
        return res.status(400).send({ message: "No valid update data provided" });
      }

    } catch (error) {
      console.error(error); // Log the error for debugging
      return res.status(500).send({ message: "Internal Server Error" });
    }
  },

  // *********Add to cart************
  addProduct: async (req, res, next) => {
    try {

      //   req userId from middleware function.......
      const userId = req.userId;

      const user = await userModel.findOne(userId);
      if (user) {
                  let imageData=null;
          if(req.files !=null){  
            cloudinary.config({
              cloud_name: process.env.CLOUDE_NAME,
              api_key: process.env.API_KEY,
              api_secret: process.env.SECRET  
            });
            console.log("req.file.image result==>>",req.files.image); 
           imageData = await cloudinary.uploader.upload(req.files.image.tempFilePath);
           if(imageData){
             req.body.image=imageData.url;
             console.log("printif req.body==>>>",req.body);
           }else{

             console.log("Image upload error !!");
             return res.status(501).send("Imge upload error");
           }
          }
          // console.log("---->>>>",req.files);
        const result = await productModel.create(req.body);
        console.log(result);
        if (result) {
          console.log("Product added Success !!");
          return res.status(200).send("Product added success");
        } else {
          console.log("Something went wrong ");
          return res.status(501).send("Product added failed");
        }
      } else {
        console.log("User not found !!");
        return res.status(404).send("User not found");
      }

    } catch (error) {
      return next(error);
    }
  },  

  // ******Seller Dashboard***********
  sellerDashboard: async (req, res, next) => {
    try {
   

      const user=await userModel.findOne({_id:req.userId, userType:'Seller'});

      if (user) {

        const result = await productModel.paginate({}, { page: 1, limit: 20 })
        if (result) {
          // console.log("Success !!", result);
          result.name = user.name;
          res.json(result);
        } else {
          console.log("No Data found !!");
        }
      }
      else {
        console.log("User not found !!");
      }

    } catch (error) {
      return next(error);
    }
  },

  // ******Buyer Dashboard******
  buyerDashboard: async (req, res, next) => {
    try {
      const userId = req.userId;
      const user = await userModel.findById({ _id: userId });
      if (user) {
        const product = await productModel.paginate({}, { page: 1, limit: 20 })
        if (product) {
          product.userName = user.name;
          res.json(product);
        } else {
          console.log("No Data found !!");
        }
      }
      else {
        console.log("User not found !!");
      }

    } catch (error) {
      return next(error);
    }
  },


  // ******Search product******
  search: async (req, res) => {
    try {

      let name = req.body;

      if (name) {
        const query = { name: { $in: name.name } };

        const result = await productModel.find();
        const fuse = new Fuse(result, fuseOptions);

        const searchResults = fuse.search(name.name);
        // console.log(searchResults);
        const sortedResults = searchResults.sort((a, b) => b.score - a.score);
        console.log(sortedResults[0].item);
        return res.send(sortedResults);

      }
      else {
        console.log("Please enter atleast one key to find profile");
        return res.send({ responseCode: 204, responseMessage: "Please enter atleast one key to find profile" })
      }

    } catch (error) {
      return res.status(500).send({ responseCode: 500, responseMessage: "Server error!!" })

    }
  },


  //*******Add to Cart*********** */ 
  addToCart: async (req, res, next) => {
    try {
      const userId = req.userId;
      const user = await userModel.findById({ _id: userId });
      if (!user) {
        res.status(404).send("Session Expired !!");
      } else {
        const productId = req.body;

        const isCart = await cartModel.findOne({ userId: userId });
        if (isCart) {
         
          const findProduct=await productModel.findById({_id:productId.product});
          console.log(findProduct);
          if(findProduct.quantity <=0 ){
            console.log("Product is running out of stock");
            return res.status(501).send("Product is running out of stock");
          }
          isCart.productId._id.push(productId.product);
          const result = await isCart.save();

          console.log(result);
          if (result) {
            console.log("Added to cart !!");
            res.status(200).json({ responseMessage: 'Success' });

          } else {
            console.log("Failed to added !!");
            res.status(400).json({ error: 'Failed' });
          }
        } else {

          // create new in the databse....
          console.log("INSERTED NEW >>>")
          const cartItem = new cartModel({
            userId: userId,
            productId: { _id: [productId.product] }
          });
          const result = await cartItem.save();
          if (result) {
            console.log("Cart added");
            res.status(200).json({ responseMessage: 'Success' });
          }

        }

      }

    } catch (error) {
      return next(error);
    }
  },

  // *******Remove from Cart *****
  remove: async (req, res, next) => {
    try {

      const userId = req.userId;
      const user = await userModel.findById({ _id: userId });

      if (user) {
        const productId = req.body;

        const isCart = await cartModel.findOne({ userId: userId });
        if (isCart) {
          const result = await cartModel.updateOne(
            { userId: userId },
            { $pull: { 'productId._id': productId.product } }
          );

          if (result) {
            console.log("Remove Successfully ", result);
            return res.status(200).json("Remove Successfully !!");
          }
          else {
            return res.status(500).json("Something went wrong !!");
          }
        }
      } else {
        console.log("Session Expired");
        return res.status(404).json("Session Expired");
      }

    } catch (error) {
      return next(error);
    }
  },


  // ******Cart************
  cart: async (req, res, next) => {
    try {
      const user = await userModel.findById({ _id: req.userId });
      if (!user) {
        return res.status(404).json({ responseMessage: 'Session Expired !!' });
      } else {
        const cart = await cartModel
          .findOne({ userId: req.userId }, { new: true })
          .populate("productId._id");

        console.log(cart);
        res.status(200).json(cart);
      }

    } catch (error) {
      return next(error);
    }
  },

  // ************Checkout*************
  checkOut: async (req, res, next) => {
    try {
      const user = await userModel.findOne(req.userId);
      const { name } = user;
      if (user) {
        // Creating order list from cart and total price
        const cart = await cartModel
          .findOne({ userId: req.userId })
          .populate("productId._id");


        let totalPrice = 0;
        cart.productId._id.forEach((product) => {
          totalPrice += product.price;
        });
        console.log("Total price: ", totalPrice);
        const userEmail=user.email;
        const orderDetails = { totalPrice, name,userEmail };
        const productIds = cart.productId._id.map((cartItem) => cartItem._id);
        orderDetails.productId = productIds;

        // Code for decrease product quantity in product database

        productIds.forEach(async(productId) => {
          await productModel.findOneAndUpdate({_id:productId},{ $inc: { quantity: -1 } });
        });


        const addOrder = await orderModel.create(orderDetails);
        console.log(addOrder);

        // creating product price and Payment link......
        try {
          const product = await stripe.products.create({
            name: "My Product",
            type: "service",
          });
          console.log(product);

          const price = await stripe.prices.create({
            product: product.id,
            unit_amount: totalPrice * 100,
            currency: "INR",
          });

          console.log("Product ID:", product.id);
          console.log("Price ID:", price.id);

          const paymentLink = await stripe.paymentLinks.create({
            line_items: [
              {
                price: price.id,
                quantity: 1,
              },
            ],
          });
          console.log(paymentLink);
          return res.status(200).json(paymentLink);
        } catch (error) {
          return next(error);
        }
      }
      return res.status(404).json("Unauthorized access !!");
    } catch (error) {
      return next(error);
    }
  },

  // ******LogOut********
  logOut: (req, res, next) => {
    try {
      console.log("+++++++++++");
      res.clearCookie('jwt');
      return res.status(200).json("SignOut success");
      // res.redirect('/login');
    } catch (error) {
      return next(error);
    }
  },

  // ***********orderHistory*************

  orderHistory:async(req,res,next)=>{
    try {
        const userId=req.userId;
      const user=await userModel.findById({_id:userId});
      if(!user){
        return res.status(404).send("User Not Found");
      }else{
        const orderHistory=await orderModel.find({userEmail:user.email}).populate("productId");
        console.log(orderHistory);
        return res.status(200).send(orderHistory);
      }
    } catch (error) {
      return next(error);
    }
  },


  // *********delete product by seller*****************8
    deleteProduct:async(req,res,next)=>{
      try {
        const user=await userModel.findOne({_id:req.userId, userType:'Seller'});
        console.log(user);
        const id=req.body.id;
        console.log("id of the product:",id);
        if(user){
            const result = await productModel.deleteOne({_id:id});
            if(result){
              return res.status(200).send("Success");
            }else{
              return res.status(501).send("Something went wrong");
            }
        }else{
          return res.status(404).send("Unauthrized !!");
        }
      } catch (error) {
        return next(error);
      }
    }
}