// Loading necessary Modules
const express = require('express')
const expressHandlebars = require('express-handlebars')
const frameguard = require('frameguard')
const mongoose = require('mongoose')
const compression = require('compression')
const app = express()
const index = require("./routes/index")
const path = require('path')
const session = require('express-session')
const flash = require('connect-flash')
const passport = require("passport")
const db = require("./config/db")
require("./config/auth")(passport)

// Configs
// Session secret must be stored in a secure file <---
app.use(session({
    secret: "42e07daa22349b03d066e097b020de46",
    resave: true,
    saveUninitialized: true
}))

// Passport (Auth)
app.use(passport.initialize())
app.use(passport.session())

// Flash (Messages)
app.use(flash())

// Middlewares
//1 - Avoid embedding
app.use(frameguard({ action: 'sameorigin' }))

//2 - Defining Message Types
app.use((req, res, next) => {
    res.locals.success_msg = req.flash("success_msg")
    res.locals.info_msg = req.flash("info_msg")
    res.locals.error_msg = req.flash("error_msg")
    res.locals.error = req.flash("error")
    res.locals.user = req.user || null;
    next()
})

//3 - Compress page text for optimization
app.use(compression())

app.use(express.urlencoded({ extended: true }))
app.use(express.json())

//4 - Handlebars (Handle Pages)
app.engine('handlebars', expressHandlebars())
app.set('view engine', 'handlebars')

// Mongoose (Database Communication)
mongoose.Promise = global.Promise;
mongoose.connect(db.mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
}).then(() => {
    console.log("Connected to MongoDB")
}).catch((err) => {
    console.log("Error connecting to MongoDB: " + err)
})

// Static Content
app.use(express.static(path.join(__dirname, "static")))

// Routes
// Main --> Secondary routes declared on index.js
app.use('/', index)

// Others
const PORT = process.env.PORT || 8081 // Random port
app.listen(PORT)