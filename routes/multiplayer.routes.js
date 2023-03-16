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
        scores[player]['allAnswers'].push(playerAnswer)
        console.log({allAnswers: scores[player]['allAnswers']})
    })
    return scores
}

function randomId(){
    let id = ''
    for (let i = 0; i < 5; i++){
        id += `${Math.round(Math.random()*9)}`
    }
    return id
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
        let gameId = -1
        while (Number(gameId) <= 0 || rooms[gameId] !== undefined){
            gameId = String(randomId())
        }

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

        socket.join(gameId)
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
                socket.emit('error', 'no-players')
                room.state = 'await-start'
                socket.emit('gameState', 'error')
            }
            else{
                if (room.state !== 'await-start'){
                    room.scores = updateScores(room.playerIds, room.curAnswers, room.curSolutions, room.scores)
                    socket.emit('scores', {scores: room.scores, players: room.playerIds})
                }
                server.to(gameId).emit('scores', {scores: room.scores, players: room.playerIds})
                if  (!room.quiz.questions.length){
                    room.state = 'game-over'
                    server.to(gameId).emit('gameState', room.state)
                }
                else{
                    room.state = 'playing'
                    console.log(room.state)
                    let curQuestion = room.quiz.questions.pop(0)
                    let points = []
                    curQuestion.answers.forEach(ans => {
                        points.push(ans.points)
                    })
                    room.curSolutions = points
                    server.to(gameId).emit('question', curQuestion)
                    server.to(gameId).emit('gameState', room.state)
                }
            }
        }
        else{
            socket.emit('error', "Your lobby wasn't created go to /multiplayer/join and try again")
        }
    })

    socket.on('start', data => {
        let {hostSocket, gameId} = data
        hostSocket.join(gameId)
        server.to(gameId).emit('gameState', 'playing')
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
                    let room = rooms[gameId]
                    room['scores'][socket.id] = {username, score: 0, allAnswers:[]}
                    room['curAnswers'][socket.id] = -1
                    room['playerIds'].push(socket.id)
                    playerGame[socket.id] = gameId
                    socket.join(gameId)
                    server.to(gameId).emit('gameState', room.state)
                    server.to(gameId).emit('scores', {scores: room.scores, players: room.playerIds})
                }
                else{
                    socket.emit('error', `Username ${username} is already in use`)
                }
            }
            else{
                socket.emit('error', `Game with id ${gameId} does not exist`)
            }
        }
        catch(error){
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
            server.to(`${hosts[socket.id]}`).emit('error', 'Host disconnected')
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
            }
        }
    })
});

httpServer.listen(PORT);



module.exports = router