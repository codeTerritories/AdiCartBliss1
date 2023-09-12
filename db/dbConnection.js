const Mongoose =require('mongoose');

Mongoose.connect(mongodb://127.0.0.1:27017/Database, { useNewUrlParser: true, useUnifiedTopology: true })
.then(()=>{
    console.log('Database Connection Success !!');
})
.catch((error)=>{
    console.log("Connection Error !!",error);
});
