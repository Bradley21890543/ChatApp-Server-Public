const FCM = require('fcm-push')
const fcm = FCM(process.env.fcmID)
module.exports = class{
    
    constructor(db){
        this.db=db
    }


    sendMessageToUserCode(code, title, message, badge){
        var messageData = {
            to: code,
            priority: 'high',
            notification: {
                body: message,
                title: title,
                badge: badge 
            },
            content_available: true,
        }

        fcm.send(messageData, function(err, response){
            if(err){
                //callback({error: err.message})
                return
            }

            //callback(response)
        })
    }
    sendMessageToUser(user, title, message){
        userCodesForUser(user, function(codes){

            codes.forEach(function(code){
                sendMessageToUserCode(code, title, message, 0)
            })
        })
    }
    sendMessageToUsers(users, title, message){
        users.forEach(function(user){
            sendMessageToUser(users, title, message)
        })
    }
    userCodesForUser(user, callback){
        var that=this
        var db=this.db
        var login = db.collection('login')
        var result=login.find({username: user})
        result.next(function(err, obj){
            if(err){
                callback([])
                return
            }
            if(!obj){
                callback([])
                return
            }
            var devices=obj.devices
            var value=[]
            devices.forEach(function(device){
                value.push(device.fbid)
            })
            callback(value)
        })
    }
    // userCodesForUsers(users, callback){
    //     count=0;
    //     function callTest(codess){
    //         if(count>=users.length-1){
    //             callback(codess)
    //         }
    //         count++
    //     }
    //     var codes=[]
    //     users.forEach(function(user){
    //         userCodesForUser(user, function(arr){
    //             arr.forEach(function(item){
    //                 codes.push(item)
    //             })

    //             callTest(codes)
    //         })

    //     })

    // }

}
