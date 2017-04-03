const express = require('express');
const app = express();
 
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const moment = require('moment');
const fs = require('fs');
const multer  = require('multer');
mongoose.Promise = global.Promise;
const Schema = mongoose.Schema;

//var timestamp = new Date().getUTCMilliseconds();

 const catSchema = new Schema({
  time:  String,
  category: {type: String, enum: ['wife', 'sister', 'friend']},
  title: String,
  details: String,
  thumbnail: String
});

 const Cat = mongoose.model('Cat', catSchema);
 
 mongoose.connect('mongodb://localhost:27017/test').then(() => {
//mongoose.connect('mongodb://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}:${process.env.DB_PORT}/cat').then(() => {
  console.log('Connected successfully.');
  //app.listen(process.env.APP_PORT);
}, err => {
  console.log('Connection to db failed: ' + err);
});

app.use(express.static('admin'));
app.use(express.static('public'));

const storage = multer.diskStorage({
    destination: function(req, file, callback){
        callback(null, 'public/files/uploads'); // set the destination
    },
    filename: function(req, file, callback){
        callback(null, file.originalname); // set the file name and extension
    }
});
const upload = multer({storage: storage});

app.post('/addrecord', 
	upload.single('imagelink'),
    (req, res) => {
		//const response = ({"id":1, "time":moment().format('YYYY-MM-DD h:mm'), "category":req.body.category, "title":req.body.title, "details":req.body.description, "thumbnail":req.file.filename});
        console.log(req.body);
        Cat.create({
            time: moment().format('YYYY-MM-DD h:mm'),
            category: req.body.category,
            title: req.body.title,
            details: req.body.description,
            thumbnail: req.file.filename
        }).then(c => {
            res.send('Cat created: ' + c.id);
        }, err => {
            res.send('Error: '+ err);
        });
		res.redirect('/');
    }
    );

app.get('/listcats', (req, res) => {
    Cat.find()
    .exec().then(
        d => {
            console.log(d);
            res.send(d);
        }
    ),
    err => {
        res.send('Error: ' + err);
    };
});

	app.listen(3006);