// Configs
const localStrategy = require("passport-local").Strategy
const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")

// User Model
require("../models/User")
const User = mongoose.model("users")

// Checking if the inputs match user stored data
module.exports = function (passport) {
    passport.use(new localStrategy({ usernameField: 'email', passwordField: 'password' }, (email, password, done) => {
        User.findOne({ email: email }).then((user) => {
            if (!user) {
                return done(null, false, { message: "Esta conta não existe!" })
            }

            bcrypt.compare(password, user.password, (error, isequal) => {
                if (isequal) {
                    return done(null, user)
                }
                else {
                    return done(null, false, { message: "Senha incorreta" })
                }
            })
        })
    }))
    passport.serializeUser((user, done) => {
        done(null, user.id)
    })

    passport.deserializeUser((id, done) => {
        User.findById(id, (err, user) => {
            done(err, user)
        })
    })
}
