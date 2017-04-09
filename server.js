require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const moment = require('moment');
const fs = require('fs');
const multer  = require('multer');
mongoose.Promise = global.Promise;
const Schema = mongoose.Schema;
//const ejs = require('ejs');
//const autoIncrement = require('mongoose-auto-increment');
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
//app.set('view engine', ejs);

//var timestamp = new Date().getUTCMilliseconds();

 const catSchema = new Schema({
  _id: String,
  time:  String,
  category: {type: String, enum: ['wife', 'sister', 'friend']},
  title: String,
  details: String,
  thumbnail: String
});

 const Cat = mongoose.model('Cat', catSchema, 'spies');
 
 //mongoose.connect('mongodb://localhost:27017/test').then(() => {
// VERY bad to not have db authentication on
mongoose.connect(`mongodb://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}:${process.env.DB_PORT}/catdb`).then(() => {
//const db = `mongodb://${process.env.DB_HOST}:${process.env.DB_PORT}/cat`;
//mongoose.connect(db).then(() => {
  console.log('Connected successfully' + Date.now());
  //app.listen(process.env.APP_PORT);
}, err => {
  console.log('Connection to db failed: ' + db + ' :: ' + err);
});

app.use(express.static('admin'));
app.use(express.static('public'));
//app.use(express.static('views'));

const storage = multer.diskStorage({
    destination: function(req, file, callback){
        callback(null, 'public/files/uploads'); // set the destination
    },
    filename: function(req, file, callback){
        callback(null, file.originalname); // set the file name and extension
    }
});

const upload = multer({storage: storage});

app.use(function(req, res, next) {
    console.log('Time:', moment(Date.now()));
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

app.post('/addrecord', 
	upload.single('imagelink'),
    (req, res) => {
		//const response = ({"id":1, "time":moment().format('YYYY-MM-DD h:mm'), "category":req.body.category, "title":req.body.title, "details":req.body.description, "thumbnail":req.file.filename});
        console.log(JSON.stringify(req.body));
        Cat.create({
			_id: Date.now(),
            time: moment().format('YYYY-MM-DD h:mm'),
            category: req.body.category,
            title: req.body.title,
            details: req.body.description,
            thumbnail: req.file.filename,
        }).then(c => {
            res.send('Cat created: ' + c.id);
        }, err => {
            res.send('Error: '+ err);
        });
		res.redirect('/');
    }
    );
//for webservice
app.post('/addcat', 
	upload.single('imagelink'),
    (req, res) => {
		const response = ({"id":1, "time":moment().format('YYYY-MM-DD h:mm'), "category":req.body.category, "title":req.body.title, "details":req.body.description, "thumbnail":JSON.stringify(req.file)});
        console.log(JSON.stringify(response));
        Cat.create({
			_id: Date.now(),
            time: moment().format('YYYY-MM-DD h:mm'),
            category: req.body.category,
            title: req.body.title,
            details: req.body.description,
            thumbnail: ""
        }).then(c => {
            res.send('Cat created: ' + c.id);
        }, err => {
            res.send('Error: '+ err);
        });
    }
);
// get all cats
app.get('/listcats', (req, res) => {
    Cat.find()
    .exec().then(
        d => {
            //console.log(d);
            res.send(d);
        }
    ),
    err => {
        res.send('Error: ' + err);
    };
});
// Get Cat by Id
app.get('/getcatbyid/:id', (req, res) => {
    Cat.findOne({"_id": (req.params.id)}, (err, result) => {
	if (err) return err;
	res.send(result);
	});
});

//get cat by name
app.get('/getcatbyname/:title', (req, res) => {
    Cat.findOne({"title": (req.params.title)}, (err, result) => {
	if (err) return err;
	res.send(result);
	});
});

//get by category
app.get('/getcatbycategory/:category', (req, res) => {
    Cat.findOne({"category": (req.params.category)}, (err, result) => {
	if (err) return err;
	res.send(result);
	});
});

//update cat fully
app.put('/updatecat', (req, res) => {
  //db.collection('quotes')
  Cat.findOneAndUpdate({_id: req.body._id}, {
    $set: {
      title: req.body.title,
      details: req.body.details,
	  category: req.body.category
    }
  }, {
    sort: {_id: -1},
    upsert: false
  }, (err, result) => {
    if (err) return res.send(err)
    res.send(result)
  })
});

app.get('/editcat/:id', (req, res) => {
  //db.collection('quotes').find().toArray((err, result) => {
	Cat.findOne({"_id": (req.params.id)}), (err, result) => {
    if (err) return console.log(err)
    // renders index.ejs
    res.render('viewone.ejs', {quotes: result})
  };
});

app.get('/delete/:id', function(req, res){
    //var db = req.db;
	console.log(JSON.stringify(req.params));
    Cat.remove({"_id": (req.params.id)}, function(err, docs) {  //db.users.remove({"_id": ObjectId("4d512b45cc9374271b02ec4f")});
        if (err) return err;
        console.log(docs);
        res.send(docs);
		//res.render // comment out for web service
    });
});

app.get('/deleteall', function(req, res){
    //var db = req.db;
	//console.log(JSON.stringify(req.params));
    Cat.remove({}, function(err, docs) {  //db.users.remove({"_id": ObjectId("4d512b45cc9374271b02ec4f")});
        if (err) return err;
        console.log(docs);
        res.send(docs);
		//res.render // comment out for web service
    });
});

	app.listen(3006);