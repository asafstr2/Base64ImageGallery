require('dotenv').config()

const express = require('express');
    app = express(), 
    mysql = require('mysql'),
    bodyParser = require("body-parser"),
    asyncHandler = require('express-async-handler'),
    imageUpload = require('./imageUpload');

//configre EJS  
app.use(bodyParser.urlencoded({
    extended: true
}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + '/public'));

//conecting to local DB if needed 
// const connection=mysql.createConnection({
// 	host      :'localhost',
// 	user      :'root',
// 	database  :'Bthere'
// });

//conecting to DB passwords are not in .env for the code review
const connection = mysql.createConnection({
    host: 'remotemysql.com',
    user: '04kiWA2xrA',
    password: "zb1byQTsTh",
    database: '04kiWA2xrA'
});



/*Create a table named "Photos" if none exists it is only for the code review */
const q = "CREATE TABLE  if not exists Photos (PhotoId INT NOT NULL AUTO_INCREMENT PRIMARY KEY, PhotoUrl 						VARCHAR(512),Discription VARCHAR(255))";
connection.query(q, (err, result) => {
    if (err) throw err;
    console.log("ok");
});

/*Getting the Images URLs arey from SQL DB and sending to /getimage to present */

app.get("/getimage", asyncHandler(async (req, res) => {
    let url = await select("SELECT PhotoUrl as url,Discription as description FROM Photos")
    res.render("home", {
        url: url
    })


}));

/*Getting the Images URL in base 64 from user converting it using imageUpload(amazon s3 service )and inserting url to SQL DB  */
app.post('/newImage', asyncHandler(async (req, res) => {
    let photoUrl = await imageUpload(req.body.photo, req.body.description)
    let photo = {
        PhotoUrl: photoUrl,
        Discription: req.body.description
    };
    let answer = await insert(photo)
    console.log(answer.message)
    res.redirect("/getimage");

}));

/*helpers to sent sql queries to DB*/

function select(q) {
    return new Promise((resolve, reject) => {
        connection.query(q, (err, results, fields) => {
            if (err) throw err;
            else resolve(results);
        })
    })
}


function insert(q) {
    return new Promise((resolve, reject) => {
        connection.query('INSERT INTO Photos SET ?', q, (err, results) => {
            if (err) throw err;
            else resolve(results);
        })
    })
}


app.listen(process.env.PORT, () => {
    console.log('server is running on ' + process.env.PORT)
});