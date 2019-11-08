// Load necessary modules
const express = require('express')
const router = express.Router()
const mongoose = require("mongoose")
require("../models/User")
require("../models/Ebook")
const User = mongoose.model("users")
const Ebook = mongoose.model("ebooks")
const bcrypt = require("bcryptjs")
const passport = require("passport")
const moment = require("moment")
const path = require('path');
const multer = require('multer')
const async = require('async');
const { loggedin } = require("../helpers/loggedin")

// Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'ebooks/')
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});
const upload = multer({ storage });

//----------------------------------------------SIMPLE ROUTES TO EACH PAGE---------------------------------------------

// Route: main page
router.get("/", (req, res) => {
    var lastadded;
    var mostdownloaded;
    async.series([
        (callback) => {
            Ebook.find({}, (err, ebooks) => {
                if (err) {
                    res.redirect("/")
                    return callback(err);
                }
                lastadded = ebooks;
                callback(null, ebooks);
            }).sort({ added: 'desc' }).limit(8)
        },
        (callback) => {
            Ebook.find({}, (err, ebooks) => {
                if (err) {
                    res.redirect("/")
                    return callback(err);
                }
                mostdownloaded = ebooks;
                callback(null, ebooks);
            }).sort({ downloads: 'desc' }).limit(4)
        }],
        (err) => {
            res.render("layouts/index", { lastadded: lastadded, mostdownloaded: mostdownloaded })
        });
});

// Route: all ebooks
router.get("/todos", (req, res) => {
    Ebook.find().sort({ bookname: '1' }).then((ebooks) => {
        res.render("layouts/all", { ebooks: ebooks })
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao listar os ebooks!")
        res.redirect("/")
    })
});

// Route: fiction ebooks
router.get("/categoria/ficcao", (req, res) => {
    Ebook.find({ genre: 'Ficção científica' }).sort({ bookname: '1' }).then((ebooks) => {
        res.render("layouts/ficcao", { ebooks: ebooks })
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao listar os ebooks!")
        res.redirect("/")
    })
});

// Route: fantasy ebooks
router.get("/categoria/fantasia", (req, res) => {
    Ebook.find({ genre: 'Fantasia' }).sort({ bookname: '1' }).then((ebooks) => {
        res.render("layouts/fantasia", { ebooks: ebooks })
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao listar os ebooks!")
        res.redirect("/")
    })
});

// Route: error 404
router.get("/404", (req, res) => {
    res.render("layouts/404")
});

// Route: about
router.get("/sobre", (req, res) => {
    res.render("layouts/about")
});

// Route: register new user
router.get("/cadastro", (req, res) => {
    res.render("layouts/register")
});

// Route: register new eBook
router.get("/addlivro", loggedin, (req, res) => {
    res.render("layouts/addbook")
});

// Route: Login
router.post("/", (req, res, next) => {
    passport.authenticate("local", {
        successRedirect: req.session.returnTo || "/",
        failureRedirect: "/",
        failureFlash: true
    })(req, res, next)
    delete req.session.returnTo
});

// Route: Logout
router.get("/logout", (req, res) => {
    req.logout()
    req.flash('info_msg', "Deslogado com sucesso!")
    res.redirect("/")
});

//--------------------------------------------------REGISTER ROUTE-----------------------------------------------------

// Route: receive data from register
router.post("/cadastro", (req, res) => {

    var errors = []

    if (req.body.password != req.body.cpassword) {
        req.flash("error_msg", "As senhas são diferentes, tente novamente!")
        errors.push()
    }

    if (errors.length > 0)
        res.render("layouts/register", { errors: errors })
    else {
        User.findOne({ email: req.body.email }).then((user) => {
            if (user) {
                req.flash("error_msg", "Já existe uma conta com esse email cadastrada")
                res.redirect("/cadastro")
            }
            else {
                const newUser = new User({
                    name: req.body.name,
                    surname: req.body.surname,
                    email: req.body.email,
                    birthday: req.body.birthday,
                    gender: req.body.gender,
                    password: req.body.password,
                    photourl: req.body.photourl
                })

                bcrypt.genSalt(10, (erro, salt) => {
                    bcrypt.hash(newUser.password, salt, (erro, hash) => {
                        if (erro) {
                            req.flash("error_msg", "Houve um erro no salvamento do usuário!")
                            res.redirect("/cadastro")
                        }

                        newUser.password = hash

                        newUser.save().then(() => {
                            req.flash("success_msg", "Usuário cadastrado com sucesso!")
                            res.redirect("/")
                        }).catch((err) => {
                            req.flash("error_msg", "Erro ao cadastrar usuário, tente novamente")
                            res.redirect("/cadastro")
                        })
                    })
                })
            }
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro interno")
            res.redirect("/")
        })
    }
});

//----------------------------------------------USER MANAGEMENT ROUTES-------------------------------------------------

// Route: user page
router.get("/user", loggedin, (req, res) => {
    User.find().then((users) => {
        res.render("layouts/user", { users: users })
    }).catch((err) => {
        console.log(err)
        req.flash("error_msg", "Houve um erro ao listar os dados do usuário!")
        res.redirect("/")
    })
});

// Route: user get edit page
router.get("/user/edit/:id", (req, res) => {
    User.findOne({ _id: req.params.id }).then((user) => {
        let birthday = moment(user.birthday).utc().format("YYYY-MM-DD")
        res.render("layouts/user_edit", { user: user, birthday: birthday })
    }).catch((err) => {
        req.flash("error_msg", "Erro interno!")
        res.redirect("/user")
    })
});

// Route: user post edit photo
router.post("/user/edit/photo", (req, res) => {
    var errors = []

    if (errors.length > 0)
        res.render("layouts/user", { errors: errors })
    else {
        User.findOne({ _id: req.body.id }).then((user) => {

            user.photourl = req.body.photourl

            user.save().then(() => {
                req.flash("success_msg", "Imagem do usuário alterada com sucesso!")
                res.redirect("/user")
            }).catch((err) => {
                req.flash("error_msg", "Erro interno ao salvar a imagem!")
                res.redirect("/user")
            })

        }).catch((err) => {
            req.flash("error_msg", "Erro ao editar a imagem do usuário!")
            res.redirect("/user")
        })
    }
});

// Route: user post edit page
router.post("/user/edit/:id", (req, res) => {
    var errors = []

    if (req.body.newpassword != req.body.cpassword) {
        req.flash("error_msg", "As senhas são diferentes, tente novamente!")
        errors.push()
    }

    if (errors.length > 0)
        res.render("layouts/user", { errors: errors })
    else {
        User.findOne({ _id: req.body.id }).then((user) => {

            if (req.body.name == user.name) { }
            else {
                user.name = req.body.name
            }

            if (req.body.surname == user.surname) { }
            else {
                user.surname = req.body.surname
            }

            if (req.body.email == user.email) { }
            else {
                user.email = req.body.email
            }

            if (req.body.birthday == user.birthday) { }
            else {
                user.birthday = req.body.birthday
            }

            if (req.body.gender == user.gender) { }
            else {
                user.gender = req.body.gender
            }

            bcrypt.compare(req.body.oldpassword, user.password, (error, isequal) => {
                if (isequal) {
                    bcrypt.genSalt(10, (erro, salt) => {
                        bcrypt.hash(req.body.newpassword, salt, (erro, hash) => {
                            if (erro) {
                                req.flash("error_msg", "Houve um erro na checagem da senha antiga!")
                                res.redirect("/user")
                            }

                            user.password = hash

                            user.save().then(() => {
                                req.flash("success_msg", "Dados do usuário alterados com sucesso!")
                                res.redirect("/user")
                            }).catch((err) => {
                                req.flash("error_msg", "Erro interno ao salvar os dados do usuário!")
                                res.redirect("/user")
                            })

                        })
                    })
                }
                else {
                    req.flash("error_msg", "Sua senha atual está incorreta!")
                    res.redirect("/user")
                }
            })

        }).catch((err) => {
            req.flash("error_msg", "Erro ao editar dados do usuário!")
            res.redirect("/user")
        })
    }
});

// Route: user delete account
router.post("/user/delete", (req, res) => {
    User.findOneAndRemove({ _id: req.body.id }).then(() => {
        req.flash("success_msg", "Usuário deletado com sucesso!")
        res.redirect("/")
    }).catch((err) => {
        req.flash("error_msg", "Erro ao deletar o usuário!")
        res.redirect("/user")
    })
});

//----------------------------------------------EBOOK MANAGEMENT ROUTES-------------------------------------------------

// Route: receive data from ebook register
router.post('/addlivro', upload.single('ebookfile'), (req, res) => {

    var errors = []

    if (errors.length > 0)
        res.render("layouts/addbook", { errors: errors })
    else {
        Ebook.findOne({ isbn: req.body.isbn }).then((ebook) => {
            if (ebook) {
                req.flash("error_msg", "Já existe um ebook com esse ISBN cadastrado")
                res.redirect("/addlivro")
            }
            else {
                const newEbook = new Ebook({
                    bookname: req.body.bookname,
                    authorname: req.body.authorname,
                    genre: req.body.genre,
                    language: req.body.language,
                    publisher: req.body.publisher,
                    edition: req.body.edition,
                    isbn: req.body.isbn,
                    cover: req.body.cover,
                    synopsis: req.body.synopsis,
                    extension: req.body.extension
                })

                newEbook.save().then(() => {
                    req.flash("success_msg", "Ebook cadastrado com sucesso!")
                    res.redirect("/")
                }).catch((err) => {
                    req.flash("error_msg", "Erro ao cadastrar ebook, tente novamente")
                    res.redirect("/addlivro")
                })
            }
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro interno")
            res.redirect("/")
        })

    }
});

// Route: ebook page
router.get('/ebook/:isbn', (req, res) => {
    Ebook.findOne({ isbn: req.params.isbn }).then((ebook) => {
        res.render("layouts/ebook", { ebook: ebook })
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao listar os dados do ebook!")
        res.redirect("/")
    })
});

// Route: ebook download
router.post('/ebook/download/:file(*)', (req, res) => {
    var file = req.params.file;
    var fileLocation = path.join('./ebooks', file);
    res.download(fileLocation, file);

    Ebook.findOne({ isbn: req.body.isbn }).then((ebook) => {
        ebook.downloads = parseInt(req.body.downloads, 10) + 1
        ebook.save()

    }).catch((err) => {
        console.log(err)
        req.flash("error_msg", "Houve um erro ao fazer o download do arquivo!")
        res.redirect("/")
    })
});

//----------------------------------------------SEARCH ROUTE-----------------------------------------------------------

// For the search query
function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

// Route: ebook search
router.get('/busca', (req, res) => {
    if (req.query.search) {
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');
        Ebook.find({ bookname: regex }).sort({ bookname: '1' }).then((ebooks) => {
            if (ebooks.length < 1) {
                req.flash("info_msg", "Nenhum ebook corresponde ao termo pesquisado, tente novamente.")
            }
            res.render("layouts/search", { ebooks: ebooks })
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro ao pesquisar pelos ebooks!")
            res.redirect("/")
        })
    }
});

module.exports = router