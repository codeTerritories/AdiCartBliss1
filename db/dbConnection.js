const Mongoose =require('mongoose');

Mongoose.connect(process.env.DB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
.then(()=>{
    console.log('Database Connection Success !!');
})
.catch((error)=>{
    console.log("Connection Error !!",error);
});
