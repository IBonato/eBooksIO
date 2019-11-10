const mongoose = require("mongoose")
const Schema = mongoose.Schema

const User = new Schema({
    name: {
        type: String,
        maxLength: 30,
        required: true
    },
    surname: {
        type: String,
        maxLength: 50,
        required: true
    },
    email: {
        type: String,
        maxLength: 50,
        required: true
    },
    birthday: {
        type: Date,
        required: true
    },
    gender: {
        type: String,
        maxLength: 10,
        default: "Outro"
    },
    password: {
        type: String,
        required: true
    },
    photourl: {
        type: String,
        default: "http://ssl.gstatic.com/accounts/ui/avatar_2x.png"
    }
})

mongoose.model("users", User)