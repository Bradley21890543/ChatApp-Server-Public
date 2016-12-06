const path = require('path')
module.exports = class {


    constructor(callback) {
        var that = this
        var calledBack = false;
        this.dataBaseHandler = new (require(path.join(__dirname, "/databaseHandler/index.js")))(function () {
            that.db = that.dataBaseHandler.db
            that.notifications = new (require(path.join(__dirname, "../notifications.js")))(that.db)
            calledBack = true;
            callback()
        })



    }


    verifyRights(chatID, userToVerify, callback) {
        this.dataBaseHandler.getData.getAllUsersInChat(chatID, function (users) {
            callback(users.includes(userToVerify), users)
        })
    }


    createChat(users, title, callback) {
        this.dataBaseHandler.addData.createChat(users,title, callback)
    }


    sendMessage(data, type, fromUser, chatID, callback) {
        var that = this
        this.verifyRights(chatID, fromUser, function (response, users) {
            if (response) {
                that.dataBaseHandler.addData.sendMessage(data, type, fromUser, chatID, function (result) {
                    if (result.success) {
                        var index = users.indexOf(fromUser);
                        var usersToNotify = users.splice()
                        usersToNotify.splice(index, 1)


                        that.dataBaseHandler.getData.getUserInfo(fromUser, function (jsonI) {
                            if (jsonI.success) {
                                if (type = "text/plain") {
                                    that.notifications.sendMessageToUsers(usersToNotify, "New Message From: " + jsonI.user.name, data)
                                } else {
                                    that.notifications.sendMessageToUsers(usersToNotify, "New Message From: " + jsonI.user.name, "Multimedia content")
                                }
                            }
                        })

                    }

                    callback(result)
                })
            } else {
                callback({ success: false, error: "Chat Not Available" })
            }
        })

    }




    getMessagesSinceInChat(sinceWhen, fromUser, chatID, callback) {
         var that = this
        this.verifyRights(chatID, fromUser, function (response) {
            if (response) {
                that.dataBaseHandler.getData.getMessagesSinceInChat(sinceWhen, chatID, callback)
            } else {
                callback({ success: false, error: "Chat Not Available" })
            }
        })

    }

    getMessagesInRangeInChat(start, end, fromUser, chatID, callback) {
         var that = this
        this.verifyRights(chatID, fromUser, function (response) {
            if (response) {
                that.dataBaseHandler.getData.getMessagesInRangeInChat(start, end, chatID, callback)
            } else {
                callback({ success: false, error: "Chat Not Available" })
            }
        })
    }
}