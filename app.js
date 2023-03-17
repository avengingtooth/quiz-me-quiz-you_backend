// ℹ️ Gets access to environment variables/settings
// https://www.npmjs.com/package/dotenv
require("dotenv").config();
const PORT = process.env.PORT || 5005;

// ℹ️ Connects to the database
require("./db");

// Handles http requests (express is node js framework)
// https://www.npmjs.com/package/express
const express = require("express");

const app = express();

const cors = require('cors')

app.use(cors())

// const server = app.listen(PORT, () => {
//     console.log(`Server listening on http://localhost:${PORT}`);
// });
  
  
// const io = require('./routes/multiplayer.routes')(server);
// ℹ️ This function is getting exported from the config folder. It runs most pieces of middleware
require("./config")(app);

// 👇 Start handling routes here

const authRoutes = require('./routes/authentication.routes')
app.use('/auth', authRoutes)

const quizRoutes = require('./routes/quiz.routes')
app.use('/quiz', quizRoutes)

// const multiplayerRoutes = require('./routes/multiplayer.routes.js')
// app.use('/multiplayer', multiplayerRoutes)

// ❗ To handle errors. Routes that don't exist or errors that you handle in specific routes
require("./error-handling")(app);


module.exports = app;
