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

* Start MongoDB, in the Terminal type the following command:

```bash
mongod
```

* Start the application (```nodemon``` will automatically restart your application every time you make a change in any ```.js``` file and save it):
```bash
nodemon app.js
```

## License
[MIT](https://choosealicense.com/licenses/mit/)
