const http = require('http')
const socketio = require('socket.io')
const PORT = 5005
const router = require("express").Router();

const httpServer = http.createServer(router)

const server = new socketio.Server(httpServer, {
    cors: {
        origin: '*'
    }
})

server.on("connection", (socket) => {
    console.log('connection')
    socket.emit('message', 'you are connected')
});

httpServer.listen(4000);



module.exports = router