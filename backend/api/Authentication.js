var express = require('express')
var nodemailer = require('nodemailer');
var MongoClient = require('mongodb').MongoClient
var bodyParser = require('body-parser')
var passwordH = require('password-hash-and-salt')
var crypto = require('crypto')
var db
var login
var login_potential

const strings = {
    username_already_taken: "Username already taken",
    forgot_something: "YOU FORGOT SOMETHING",
    code_generation_error: "internal error",
    password_error: "OOPS",
    database_error: "db error",
    old_verify: "not valid",
    bad_combo: "FAIL"

}


var smtpConfig = {
    host: 'smtp.zoho.com',
    port: 465,
    secure: true, // use SSL 
    auth: {
        user: 'donotreply@bamapp.net',
        pass: process.env.emailpass
    }
};

var transporter = nodemailer. createTransport(smtpConfig)
var send = transporter.templateSender({
    subject: "Verify Account for {{username}}",
    test: "Please visit {{address}} to verify",
    html: "Please go <a href='{{address}}'>here</a> to verify."

}, {
        from: "donotreply@bamapp.net"

    })
module.exports = function (db) {
    login = db.collection("login")
    login_potential = db.collection("login_potential")

    this.register = function (username, password, email, name, callback) {
        var returnvalue = { success: false }
        var date = new Date()
        console.log("GOTCHA")
        // res.write("<br>Registering " + username + " Now<br>")

        if (!username || !password || !email || !name) {
            returnvalue.error = strings.forgot_something
            callback(returnvalue)
            return;
        }

        login_potential.find({ username: username }).count(function (err, number) {
            if (err) {
                returnvalue.error = strings.database_error
                callback(returnvalue)
                return;

            }
            if (number > 0) {
                returnvalue.error = strings.username_already_taken
                callback(returnvalue)
                return;
            }
            login.find({ username: username }).count(function (err, number) {
                if (number <= 0) {
                    passwordH(password).hash(function (error, hash) {
                        if (!error) {
                            //Generate Random Email Code
                            var code = crypto.randomBytes(48, function (err, buffer) {
                                if (err) {
                                    returnvalue.error = strings.code_generation_error
                                    callback(returnvalue)
                                    return;
                                }

                                send({ to: email }, { username: username, address: "https://bamapp.net/requests/verify?id=" + buffer.toString('hex') + "&username=" + username })
                                login_potential.update({ username: username }, { username: username, password: hash, email: email, name: name, createdAt: new Date(), verifyCode: buffer.toString('hex'), expireAfterSeconds: 1800 }, { upsert: true })

                                //res.write("YAY: " + hash)
                                returnvalue.success = true
                                callback(returnvalue)
                                return;
                            })


                        } else {
                            returnvalue.error = strings.password_error
                            callback(returnvalue)
                            return;
                        }

                    })

                } else {
                    returnvalue.error = strings.username_already_taken
                    callback(returnvalue)
                    return;
                }
            })
        })



    }

    this.verify = function (code, username, callback) {
        var returnvalue = { success: false }
        var result = login_potential.find({ username: username, verifyCode: code })
        result.count(function (err, number) {
            if (err) {
                returnvalue.error = strings.database_error
                callback(returnvalue)
                return
            }
            if (number <= 0) {
                returnvalue.error = strings.old_verify
                callback(returnvalue)
                return
            }

            result.next(function (err, item) {
                if (err) {
                    returnvalue.error = strings.database_error
                    callback(returnvalue)
                    return
                }

                login.insert({ username: item.username, password: item.password, email: item.email, name: item.name, date: new Date(), devices: [] })
                login_potential.remove({ username: item.username })
                returnvalue.success = true
                callback(returnvalue)
                return;
            })

        })

    }
    this.login = function (username, password, callback) {
        var returnvalue = { success: false }
        if (!username || !password) {
            returnvalue.error = strings.forgot_something
            callback(returnvalue)
            return
        }
        var result = login.find({
            $or: [
                { username: username },
                { email: username }
            ]
        })
        result.hasNext(function (err, r) {
            if (r) {
                result.next(function (err, obj) {
                    passwordH(password).verifyAgainst(obj.password, function (err, verified) {
                        if (verified) {

                            returnvalue.success = true
                            callback(returnvalue)
                            return

                        } else {
                            returnvalue.error = strings.bad_combo
                            callback(returnvalue)
                            return
                        }

                    })
                })
            } else {
                returnvalue.error = strings.bad_combo
                callback(returnvalue)
                return
            }

        })

    }
    this.addDevice = function(username, password, deviceID, callback){

        this.login(username, password, function(result){
           var resultValue={success:false}
            if(result.success){
                var device={fbid: deviceID}
                login.findAndModify({username: username}, [], {$push: {devices: device}}, {}, function(err, doc){
                    if(err){
                        callback(resultValue)
                    }else{
                        resultValue.success=true
                        callback(resultValue)
                    }

                })

            }else{
                callback(resultValue)
            }
        })


    }
    return this;
}
