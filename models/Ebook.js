const mongoose = require("mongoose")
const Schema = mongoose.Schema

const Ebook = new Schema({
    bookname: {
        type: String,
        maxLength: 100,
        required: true
    },
    authorname: {
        type: String,
        maxLength: 50,
        required: true
    },
    genre: {
        type: Array,
        required: true
    },
    language: {
        type: String,
        maxLength: 20,
        required: true
    },
    publisher: {
        type: String,
        maxLength: 50,
        required: true
    },
    edition: {
        type: Number,
        maxLength: 1,
        required: true
    },
    isbn: {
        type: String,
        required: true
    },
    extension: {
        type: String,
        required: true
    },
    cover: {
        type: String,
        maxLength: 200,
        required: true
    },
    synopsis: {
        type: String,
        required: true
    },
    downloads: {
        type: Number,
        default: 0
    },
    added: {
        type: Date,
        default: Date.now()
    }
})

mongoose.model("ebooks", Ebook)