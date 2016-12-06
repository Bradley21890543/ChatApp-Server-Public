var http = require('http')
var https = require('https')
var express = require('express')
var app = express()
var fs = require('fs')
var path = require('path')
var url = require('url')
const realtime = require(path.join(__dirname, 'backend/realtime.js'))
var credentials = {
    key: fs.readFileSync(path.join(__dirname, 'ssl/privkey.pem')),
    cert: fs.readFileSync(path.join(__dirname, 'ssl/cert.pem'))
}

var httpsServer = https.createServer(credentials, app)
try {
    var io = realtime(httpsServer)
}
catch (e) {

}
var httpServer = http.createServer(app)
var createHandler = require('github-webhook-handler')
try{
app.use("/requests", require("./backend/index.js"))
}
catch(e){
    
}

var backendHandler = createHandler({ path: "/backend", secret: "hifsdagyuefwyuy89032y832798tr78239" })
app.post("/backend", function (req, res) {
    //update the git
    backendHandler(req, res, function (error) {
        console.log("ERROR")
    })
})
backendHandler.on('push', function (even) {
    require('child_process').execSync("su bamapp -c'git pull'")
    console.log("pulled back")
    process.exit(1)//reboot the process
})
var frontendHandler = createHandler({ path: "/frontend", secret: "hifsdagyuefwyuy89032y832798tr78239" })
app.post("/frontend", function (req, res) {
    //update the git
    frontendHandler(req, res, function (error) {
        console.log("ERROR")
    })
})
frontendHandler.on('push', function (even) {
    require('child_process').exec("cd ../MainSite; su bamapp -c'git pull'")
    console.log("pulled front")
})

app.use(express.static(__dirname + "/../MainSite"))
console.log(__dirname + "/../MainSite")




httpServer.listen(80)
httpsServer.listen(443)

