//importing express
const express = require('express');

//creating a express instance 
const app = express();
const port = 4000;

//Importing the email functionality from mailController file
const emailServices = require('./mailController');
//At this endpoint mail services works
app.get('/', emailServices);

app.listen(port, ()=>{
    console.log(`Server listening at port: ${port}`);
})