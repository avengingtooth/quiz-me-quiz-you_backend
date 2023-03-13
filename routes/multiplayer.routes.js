const http = require('http')
const socketio = require('socket.io')
const PORT = 4000
const router = require("express").Router();

const httpServer = http.createServer(router)

const server = new socketio.Server(httpServer, {
    cors: {
        origin: '*'
    }
})

const rooms = {}
const hosts = {}

server.on("connection", (socket) => {
    console.log('connection', socket.query)
    socket.emit('message', 'you are connected')

    // host code
    socket.on('quiz-id', data => {
        let { quiz } = data
        let gameId = Math.round(Math.random()*5000)
        hosts[socket.id] = gameId
        rooms[gameId] = {
            host: socket.id,
            players: [],
            quiz: quiz
        }

        socket.emit('code', gameId)
    })

    socket.on('sendQuestion', () => {
        console.log('sending')
        let room = rooms[hosts[socket.id]]
        socket.broadcast.to(room.players).emit('question', 0)
        console.log(room.players)
    })

    // players code
    socket.on('join', gameId => {
        socket.join(rooms[gameId].players)
        socket.emit('join-success', 'connection successful')
        // rooms.emit('join-success', `connection successful ${rooms[gameId]['players'].length}`)
    })


    socket.on("disconnect", (reason) => {
        if (hosts[socket.id]){
            delete rooms[hosts[socket.id]]
            delete hosts[socket.id]
        }
        else{
            console.log(socket.id)
        }
        console.log('disconnected')
    })
});

httpServer.listen(PORT);



module.exports = router