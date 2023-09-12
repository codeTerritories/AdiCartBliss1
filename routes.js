const express = require('express');
const router = express.Router();
const controller=require('./controller/userController');
const commonFunction=require('./common/commonFunction')
const upl=require('./common/multer');


//Home page
router.get('/', (req, res) => {
    res.render('introduction');
});

// Route signup
router.get('/signUp', (req, res) => {
    res.render('signUp');
  });
router.post("/signup",controller.signUp);


// Email Verification route ......
router.get('/verifyEmail/:email', controller.verifyEmail); 



//...... Buyer Dashboard Route........
router.get('/buyerDashboard', (req, res) => {
    res.render('buyerDashboard');
  });
router.get('/buyerDashboards',commonFunction.verifyToken,controller.buyerDashboard)

  // ....SellerDashboard Rout......
router.get('/sellerDashboard', (req, res) => {
    res.render('sellerDashboard');
  });

 router.get('/sellerDashboards',commonFunction.verifyToken,controller.sellerDashboard);

//  ......Add to cart..........

router.post('/addToCart',commonFunction.verifyToken,controller.addToCart);

  // ......ProductList Route.........
router.get('/productList', (req, res) => {
    res.render('productListing');
  });

  // ........Cart ........
router.get('/shoppingCart', (req, res) => {
    res.render('shoppingCart');
  });
router.get('/cart',commonFunction.verifyToken,controller.cart);

// ........Remove from cart....
router.post('/removeFromCart',commonFunction.verifyToken,controller.remove);

// .......Messaging.........
router.get('/messaging', (req, res) => {
    res.render('messaging');
  });

//...Check-Out.........
router.post('/checkOut',commonFunction.verifyToken,controller.checkOut); 


// *****search*********
router.post('/search',controller.search);


// *******About-Us**********
router.get('/aboutUs', (req, res) => {
    res.render('aboutUs');
  });
router.get('/contact', (req, res) => {
    res.render('contact');
  });
router.get('/privacyPolicy', (req, res) => {
    res.render('privacyPolicy');
  });
router.get('/terms&policy', (req, res) => {
    res.render('terms&policy');
  });

  // ...........Order history.........
  router.get('/orderHistory', (req, res) => {
    res.render('orderHistory');
  });
  router.get('/orderHistorys',commonFunction.verifyToken,controller.orderHistory);

  router.post('/deleteProduct',commonFunction.verifyToken,controller.deleteProduct);


  // .......profile...........
router.get('/userProfile', (req, res) => {
    res.render('userProfile');
  });
router.get('/profile',commonFunction.verifyToken,controller.profile);


// *******Edit Profile *************
router.get('/editProfile',(req,res)=>{ 
  res.render('editProfile'); 
});
router.post('/update-profile',commonFunction.verifyToken,controller.editProfile); 



// ......Login.........
router.get('/login', (req, res) => {
    res.render('login');
  });
router.post('/login',controller.logIn);

// .........Logout......
router.get('/logOut',controller.logOut);

// .......Add-Product........
router.post('/addProduct',commonFunction.verifyToken,controller.addProduct);




// render 404.....
router.use((req, res) => {
    res.status(404).render('404');
});


module.exports = router;