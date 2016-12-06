module.exports = class {

    constructor(db, ctn) {
        this.db = db
        this.chats = db.collection("chats")
        var that = this
        this.currentCount = 0;
        this.chats.find({}).sort({ chatID: -1 }).nextObject(function (err, object) {

            if (object == null) {
                that.currentCount = 0
                if (err) {
                    console.log(err.message)
                }
            } else {
                // console.log("GOT NUMBER")
                that.currentCount = object.chatID;
            }
            ctn();
        })
    }


    createChat(users, title, callback) {

        if(users==null || title==null){
            callback({success:false, error: "Missing"})
            return
        }

        var messages = [{ sender: "ChatApp", content: "This conversation is empty. Please add to it.", type: "text/plain", number: 0 }]
        // console.log("a")

        this.currentCount++
        // console.log("b")
        var id = this.currentCount
        // console.log("c")
        this.chats.insert({ chatID: id, users: users, title:title, messages: messages, count: 0 }, function (err, data) {
            if (!err) {
                callback({success: true})
            } else {
                callback({success: false, error: err.message})
            }

        })

    }

    sendMessage(data, type, fromUser, chatID, callback) {
        var that = this
        if(data==null || type==null || fromUser==null || chatID==null){
            callback({success: false, error: "MISSING"})
            return
        }
        this.chats.findAndModify({ chatID: chatID }, [], { $inc: { count: 1 } }, {}, function (err, doc) {
            if (err) {
                callback({success: false, error: err.message})
                return
            }
            that.chats.find({ chatID: chatID }).next(function (err, object) {
                if (err) {
                    callback({success: false, error: err.message})
                    return
                } else if (object == null) {
                    callback({success: false, error: "Bad Chat"})
                    return
                }



                //console.log(doc)
                var message = { sender: fromUser, content: data, type: type, number: doc.value.count+1}

                that.chats.findAndModify({ chatID: chatID }, [], { $push: { messages: message } }, {}, function (err, doc) {
                    callback({success: err==null, error: err})

                })
            })
        })

    }



}
