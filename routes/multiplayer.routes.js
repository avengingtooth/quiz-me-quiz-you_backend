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

// whenever a user connectes to the server the server listens for the emits with the names in socket.on()
// once the socket disconnects it goes into .on("disconnect")
server.on("connection", (socket) => {
    socket.emit('message', 'you are connected')

    // host code
    socket.on('quiz-id', data => {
        // sends the quiz by data
        // new room is created into the rooms obj
        // the room id is set and the host is linked to the gameId in hosts by its socket.id
        // the gameId is sent back to the host so the host can display it
        let { quiz } = data
        let gameId = Math.round(Math.random()*5000)
        hosts[socket.id] = gameId
        rooms[gameId] = {
            host: socket.id,
            players: [],
            quiz: quiz,
            scores: {},
            curAnswers: {}
        }

        socket.emit('code', gameId)
    })

    socket.on('sendQuestion', () => {
        // when the host presses on next question
        // sends a new question to all connected players
        // if game is over sends game over to the players to change state to over and show results
        let room = rooms[hosts[socket.id]]
        if (room.quiz.questions.length){
            socket.broadcast.to(room.players).emit('question', room.quiz.questions.pop(0))
        }
        else{
            console.log('over')
            socket.broadcast.to(room.players).emit('gameState', 'game-over')
        }
    })

    // players code
    socket.on('join', data => {
        // on join server collects gameId and username
        // checks if username already exists in game
        // if username exists it doesnt allow socket to be added to room

        let {gameId, username} = data
        try{
            console.log(username, 'li')
            let usernameUsed = false
            // if (Object.keys(rooms[gameId]['scores']).forEach(id => {
            //     let user = rooms[gameId]['scores'][id]
            //     if (user.username === username){
            //         usernameUsed = true
            //     }
            // }))

            if (usernameUsed){
                console.log('used')
                socket.emit('join-success', false)
            }
            else{
                console.log('ok')
                rooms[gameId]['scores'][socket.id] = {username, score: 0}
                rooms[gameId]['curAnswers'][socket.id] = -1
                socket.join(rooms[gameId].players)
                socket.emit('join-success', true)
            }
        }
        catch{
            socket.emit('join-success', false)
        }
    })

    socket.on('updateAnswer', (data) => {
        let { aInd, gameId } = data
        console.log(gameId, rooms[gameId]['curAnswers'], 'gameId')
        rooms[gameId]['curAnswers'][socket.id] = aInd
        console.log(gameId, rooms[gameId]['curAnswers'], 'asdf')
    })


    socket.on("disconnect", (reason) => {
        if (hosts[socket.id]){
            delete rooms[hosts[socket.id]]
            delete hosts[socket.id]
        }
        console.log('disconnected')
    })
});

httpServer.listen(PORT);



module.exports = router