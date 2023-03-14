const http = require('http')
const socketio = require('socket.io')
const PORT = process.env.SOCKET_PORT || 4000;
const router = require("express").Router();

const httpServer = http.createServer(router)

const server = new socketio.Server(httpServer, {
    cors: {
        origin: '*'
    }
})

const rooms = {}
const hosts = {}
const playerGame = {}

function updateScores(playerIds, curAnswers, curSolutions, scores){
    playerIds.forEach(player => {
        let playerAnswer = curAnswers[player]
        if (playerAnswer >= 0){
            scores[player]['score'] += curSolutions[playerAnswer]
        }
    })
    return scores
}

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
            host: socket,
            playerIds: [],
            quiz: quiz,
            scores: {},
            curAnswers: {},
            curSolutions: [],
            state: 'await-start'
        }

        socket.emit('code', gameId)
    })

    socket.on('sendQuestion', () => {
        // when the host presses on next question
        // sends a new question to all connected players
        // if game is over sends game over to the players to change state to over and show results
        // checks that there is at least one player connected to send the questions
        let gameId = hosts[socket.id]
        if (gameId){
            let room = rooms[gameId]

            if (!room.playerIds.length){
                socket.to(`${gameId}`).emit('error', 'no-players')
            }
            else{
                room.scores = updateScores(room.playerIds, room.curAnswers, room.curSolutions, room.scores)
                socket.emit('scores', {scores: room.scores, players: room.playerIds})
                socket.to(`${gameId}`).emit('scores', {scores: room.scores, players: room.playerIds})

                if  (!room.quiz.questions.length){
                    if (room.state !== 'game-over'){
                        console.log('first time')
                        room.state = 'game-over'
                    }
                    socket.to(`${gameId}`).emit('gameState', 'game-over')
                }
                else{
                    let curQuestion = room.quiz.questions.pop(0)
                    let points = []
                    curQuestion.answers.forEach(ans => {
                        points.push(ans.points)
                    })
                    room.curSolutions = points
                    socket.to(`${gameId}`).emit('question', curQuestion)
                    socket.to(`${gameId}`).emit('gameState', 'playing')
                }
            }
        }
        else{
            socket.emit('error', "Your lobby wasn't created go to /multiplayer/join and try again")
        }
    })

    // players code
    socket.on('join', data => {
        // on join server collects gameId and username
        // checks if username already exists in game
        // if username exists it doesnt allow socket to be added to room
        // otherwise sends an error message with a failed joinning

        let {gameId, username} = data
        let room = rooms[gameId]
        try{
            if (room){
                let uniqueUsername = true
                room.playerIds.map(curPlayer => {
                    if(room['scores'][curPlayer]['username'] === username){
                        uniqueUsername = false
                    }
                })

                if (uniqueUsername){
                    rooms[gameId]['scores'][socket.id] = {username, score: 0}
                    rooms[gameId]['curAnswers'][socket.id] = -1
                    rooms[gameId]['playerIds'].push(socket.id)
                    rooms[gameId].host.emit('player-joined', username)
                    playerGame[socket.id] = gameId
                    socket.join(`${gameId}`)
                    socket.emit('gameState', 'await-start')
                }
                else{
                    socket.emit('gameState', 'error')
                    socket.emit('error', 'Username already in use')
                }
            }
            else{
                socket.emit('gameState', 'error')
                socket.emit('error', 'Incorrect room pin')
            }
        }
        catch(error){
            console.log(error)
            socket.emit('error', error)
        }
    })

    socket.on('updateAnswer', (data) => {
        let { aInd, gameId } = data
        if (rooms[gameId] && typeof aInd === 'number'){
            rooms[gameId]['curAnswers'][socket.id] = aInd
        }
    })


    socket.on("disconnect", (reason) => {
        if (hosts[socket.id]){
            delete rooms[hosts[socket.id]]
            delete hosts[socket.id]
        }
        else{
            let room = rooms[playerGame[socket.id]]
            if (room){
                delete room['scores'][socket.id]
                delete room['curAnswers'][socket.id]
                let ind = room['playerIds'].indexOf(socket.id)
                room['playerIds'].splice(ind, 1)
                room.host.emit('player-disconnected', ind)
            }
        }
    })
});

httpServer.listen(PORT);



module.exports = router