# eBooksIO

E-book web repository made in Node.js with MongoDB, supporting user register/edit, e-book upload/download and search. You can see the deployed version on Heroku here: [eBooksIO](https://ebooksio.herokuapp.com).

## Installation

* Install [Node.js](https://nodejs.org/en/)
* Install [MongoDB](https://www.mongodb.com)

* Install all dependencies from the package.json file in the current folder, in the Terminal type the following command (you need a package manager):

```bash
npm install
```

* Create a folder in your local drive called ```data``` and another one inside it called ```db```:
```bash
C:\data\db
```

* Add Mongo’s bin folder to the [Path Environment Variable](https://dangphongvanthanh.wordpress.com/2017/06/12/add-mongos-bin-folder-to-the-path-environment-variable/)

## Usage

* Create the file ```db.js``` in the folder ```config``` with the following code:

```node
if (process.env.NODE_ENV == "production") {
    module.exports = { mongoURI: "URL_to_your_Mongo_Server" }
}
else {
    module.exports = { mongoURI: "mongodb://user:pwd@localhost:27017/nameofthedatabase" } //Local URL to access via Browser
}
```

* Start MongoDB, in the Terminal type the following command:

```bash
mongod
```

* Create new database and admin:

```bash
mongo

use nameofthedatabase
db.createUser(
  {
    user: "myDatabaseAdmin",
    pwd: "abc123",
    roles: [ { role: "dbOwner", db: "nameofthedatabase" } ]
  }
)
```

* Start the application (```nodemon``` will automatically restart your application every time you make a change in any ```.js``` file and save it, if you don't have the package, you can install it globally with ```npm install -g nodemon```):
```bash
nodemon app.js
```

* Open ```localhost:8081``` in your Browser.

## License
[MIT](https://choosealicense.com/licenses/mit/)
