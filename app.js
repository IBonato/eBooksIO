// Loading necessary Modules
const express = require('express');
const Handlebars = require('handlebars')
const expressHandlebars = require('express-handlebars');
const { allowInsecurePrototypeAccess } = require('@handlebars/allow-prototype-access')
const frameguard = require('frameguard')
const bodyparser = require('body-parser')
const mongoose = require('mongoose')
const compression = require('compression')
const fs = require('fs')
const app = express()
const index = require("./routes/index")
const path = require('path')
const session = require('express-session')
const flash = require('connect-flash')
const passport = require("passport")
const db = require("./config/db")
const SitemapGenerator = require('sitemap-generator')
require("./config/auth")(passport)

// Configs
// Session
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
app.use(frameguard({ action: 'sameorigin' }))
app.use((req, res, next) => {
    res.locals.success_msg = req.flash("success_msg")
    res.locals.info_msg = req.flash("info_msg")
    res.locals.error_msg = req.flash("error_msg")
    res.locals.error = req.flash("error")
    res.locals.user = req.user || null;
    next()
})
app.use(compression())

// Body Parser
app.use(bodyparser.urlencoded({ extended: true }))
app.use(bodyparser.json())

// Handlebars (Handle Pages)
app.engine('handlebars', expressHandlebars({
    handlebars: allowInsecurePrototypeAccess(Handlebars)
}))
app.set('view engine', 'handlebars')

// Mongoose (Database Communication)
mongoose.Promise = global.Promise;
mongoose.connect(db.mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log("Connected to MongoDB")
}).catch((err) => {
    console.log("Error connecting to MongoDB: " + err)
})

// Static Content
app.use(express.static(path.join(__dirname, "static")))

// Sitemap generator
const generator = SitemapGenerator('https://ebooksio.herokuapp.com/', {
    stripQuerystring: false,
    changeFreq: 'weekly'
})

// Register event listeners
generator.on('done', () => {
    // sitemaps created
})
// Start the crawler
generator.start()
var sitemap;

// Routes
// Main --> Secondary routes declared on index.js
app.use('/', index)

// Sitemap Route
app.get('/sitemap.xml', (req, res) => {
    sitemap = fs.readFileSync(path.join(__dirname, "sitemap.xml"));
    res.end(sitemap);
});

// Others
const PORT = process.env.PORT || 8081 // Random port
app.listen(PORT)