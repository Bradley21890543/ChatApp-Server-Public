var express = require('express')
var router = express.Router()
var nodemailer = require('nodemailer');
var MongoClient = require('mongodb').MongoClient
var bodyParser = require('body-parser')
var passwordH = require('password-hash-and-salt')
var crypto = require('crypto')
var db
var login
var login_potential
const path = require('path')
var authentication;

router.use(bodyParser.json());       // to support JSON-encoded bodies
router.use(bodyParser.urlencoded({ extended: true })); // to support URL-encoded bodies
    //initialize DB
    MongoClient.connect("mongodb://localhost/ChatApp", function (err, dbb) {
        if (err) {
            console.log(err.message)
        }

        //RUN THIS THE FIRST TIME: db.login_potential.createIndex( { "createdAt": 1 }, { expireAfterSeconds: 1800 } )
        //res.write("Connected successfully to server");
        db = dbb;
        console.log("setting auth")
        authentication=require(path.join(__dirname, "api/Authentication.js"))(db)
    
    });


router.post("/register", function (req, res) {
    var username = req.body.username
    var password = req.body.password
    var email = req.body.email
    var name = req.body.name
    authentication.register(username, password, email, name, function(data){
        res.send(JSON.stringify(data))
    })
})


router.get("/verify", function (req, res) {
    var code = req.query.id
    var username = req.query.username
    authentication.verify(code, username,function(data){
        res.send(JSON.stringify(data))
    })
})

router.post("/addDevice", function (req, res) {
    var username = req.body.username
    var password = req.body.password
    var deviceID = req.body.deviceID
    authentication.addDevice(username, password, deviceID, function(data){
        res.send(JSON.stringify(data))
    })
})

router.post("/login", function (req, res) {
    var username = req.body.username
    var password = req.body.password
   authentication.login(username, password,function(data){
        res.send(JSON.stringify(data))
    })


})

module.exports = router;
