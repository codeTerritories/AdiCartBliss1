require('dotenv').config();
const express = require('express');
const app= express();
const routes = require('./routes');
const path=require('path');
require('./db/dbConnection');
const ejs = require('ejs');
const cookieParser = require('cookie-parser');
const fileUpload = require('express-fileupload');



const http = require('http');
const server = http.createServer(app); 
const {Server}=require('socket.io');
const io=new Server(server);
const bodyParser = require('body-parser');


// const io = require('socket.io')(server);


// Middleware
app.use(express.urlencoded({extended:true}));
app.use(express.json()); 

// Use cookie-parser middleware
app.use(cookieParser());
app.use(bodyParser.json());
app.use(fileUpload(
  { useTempFiles: true }
));

app.use(express.static('views'));

app.set('view engine', 'ejs'); 
app.set('views', path.join(__dirname,'views'));



// Route
app.use('/', routes);


// socket connection...
io.on('connection', (socket,err) => {
   console.log("socket connected !!"); 
  // Handle chat messages
  
  socket.on('chatMessage', (message) => {
    io.emit('chatMessage', { text: message});
    
  });

 
  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(" A user disconnected");
  });
});




const port = process.env.PORT || 5000;
server.listen(port,()=>{
    console.log(`Server is running on ${port}`);
});




