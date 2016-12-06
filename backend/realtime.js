const path = require('path')
module.exports = function (httpsServer) {
    const socketio = require('socket.io')
    const fcm = require('fcm-push')
    var io = socketio(httpsServer)
    var db
    var messages
    messages = new (require(path.join(__dirname, "/realtime/messages.js")))(function (error) {
        if (error) {
            console.log(error)
            return;
        }
        console.log("Working")
        db = messages.dataBaseHandler.db
    })



    io.on('connection', function (socket) {
        socket.authenticated = false;
        socket.on('authenticate', function (data, sendResponse) {
            require(path.join(__dirname, "api/Authentication.js"))(db).login(data.username, data.password, function (json) {
                socket.authenticated = json.success
                if (socket.authenticated) {
                    socket.username = data.username
                }
                sendResponse({ success: socket.authenticated })

            })
        })

        function auth(res) {
            if (!socket.authenticated) {
                res({ error: "authentication" })
                return false
            } else {
                return true
            }
        }

        socket.on('userInfo', function (data, sendResponse) {
            if (!auth(sendResponse)) return

            messages.dataBaseHandler.getData.getUserInfo(data.username, function (info) {
                if (info.user) {
                    info.user.password = null
                    info.user.devices = null
                    info.user.email = null
                }
                sendResponse(info)
            })

        })

        socket.on('createChat', function (data, sendResponse) {
            if (!auth(sendResponse)) return
            if (!data.users.includes(socket.username)) { sendResponse({ success: false, error: "MUST INCLUDE YOU" }); return }
            messages/*.dataBaseHandler.addData*/.createChat(data.users, data.title, sendResponse)
        })

        socket.on('sendMessage', function (data, sendResponse) {
            if (!auth(sendResponse)) return
            messages/*.dataBaseHandler.addData*/.sendMessage(data.data, data.type, socket.username, data.chatID, sendResponse)

        })

        socket.on('getMessagesSinceInChat', function (data, sendResponse) {

            if (!auth(sendResponse)) return
            messages.getMessagesSinceInChat(data.sinceWhen, socket.username, data.chatID, sendResponse)

        })
        socket.on('getMessagesInRangeInChat', function (data, sendResponse) {

            if (!auth(sendResponse)) return
            messages.getMessagesInRangeInChat(data.start, data.end, socket.username, data.chatID, sendResponse)

        })
    })






    return io;
}