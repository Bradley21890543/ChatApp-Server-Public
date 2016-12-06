module.exports = class {

    constructor(db) {
        this.db = db
        this.chats = db.collection("chats")
    }


    getAllUsersInChat(chatID, callback) {
        var result = this.chats.find({ chatID: chatID })
        result.next(function (err, data) { if (data != null) { callback(data.users) } else { callback([]) } })
    }

    getUserInfo(user, callback) {
        this.db.collection("login").find({ username: user }).next(function (err, object) {
            if (err || !object) {
                callback({ success: false })
            } else {
                var obj2 = object
                callback({ success: true, user: obj2 })
            }
        })
    }
    getMessagesSinceInChat(sinceWhen, chatID, callback) {
        var result = this.chats.aggregate([
            { $match: { chatID: chatID } },
            { $unwind: '$messages' },
            { $match: { 'messages.number': { $gt: sinceWhen } } },
            { $group: { _id: '$_id', messages: { $push: '$messages' } } }
        ], function (err, result) {

            if (err) {
                callback({ success: false, error: err.message })
                return;
            }

            if (result[0] == null) {
                callback({ success: true, result: [] })
                return
            }

            callback({ success: true, result: result[0].messages })
        })
    }

    getMessagesInRangeInChat(start, end, chatID, callback) {
        var result = this.chats.aggregate([
            { $match: { chatID: chatID } },
            { $unwind: '$messages' },
            { $match: { 'messages.number': { $gt: start, $lt: end } } },
            { $group: { _id: '$_id', messages: { $push: '$messages' } } }
        ], function (err, result) {

            if (err) {
                callback({ success: false, error: err.message })
                return;
            }
            if (result[0] == null) {
                callback({ success: true, result: [] })
                return
            }
            callback({ success: true, result: result[0].messages })
        })
    }

}
