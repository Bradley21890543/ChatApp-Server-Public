const MongoClient = require('mongodb').MongoClient
var chats;
var db;
const path = require('path')

module.exports = class {
    constructor(callback) {
        var that=this
        MongoClient.connect("mongodb://localhost/ChatApp", function (err, db) {
            chats = db.collection("chats")
            that.getData = new (require(path.join(__dirname, "getData.js")))(db)
            that.addData = new (require(path.join(__dirname, "addData.js")))(db, callback)
            that.db=db
        });
    }




}