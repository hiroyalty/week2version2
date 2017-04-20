require('dotenv').config();
const https = require('https');
const glob = require('glob');
const http = require('http');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy; //new installed
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const moment = require('moment');
const fs = require('fs');
const multer  = require('multer');
mongoose.Promise = global.Promise;
const Schema = mongoose.Schema;


const sslkey = fs.readFileSync('ssl-key.pem');
const sslcert = fs.readFileSync('ssl-cert.pem')

const options = {
      key: sslkey,
      cert: sslcert
};

const express = require('express');
const app = express();

//we are using username and password in .env
// note for some reason the process.env pick the system user in my case Ayo as the username 
// of the process.env.username, thus you have to use 'Ayo'
passport.use(new LocalStrategy(
  (username, password, done) => {
	  //console.log(username, process.env.username, process.env.password);
    if (username !== process.env.username || password !== process.env.password) {
      done(null, false, {message: 'Incorrect credentials.'});
      return;
    }
    return done(null, { username: username });
  }
));

//add the user in session
passport.serializeUser((user, done) => {
  console.log(user);
  done(null, user);
});

passport.deserializeUser((user, done) => {
  console.log(user);
  done(null, user);
});

app.use(session({
  secret: process.env.secret,
  resave: true,
  saveUninitialized: true
}));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(passport.initialize());
app.use(passport.session());

//*******Do database stufss here*********/
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
//******* DB ends here *****************//

app.use(express.static('admin'));
app.use(express.static('public'));
app.set('views', (__dirname + '/views'));
app.set('view engine', 'pug');

//********** force https redirection here*********/
https.createServer(options, app).listen(3006);
//force redirection from http to https
http.createServer((req, res) => {
      res.writeHead(301, { 'Location': 'https://localhost:3006' + req.url });
      res.end();
}).listen(8080);

//************* https redirection ends here***********/

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

app.post('/yeah', function(req,res){
  console.log(req.body);
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
            //res.send('Cat created: ' + c.id);
			return res.render('home');
        }, err => {
            res.send('Error: '+ err);
        });
		//res.redirect('/');
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
            thumbnail: req.file.filename,
        }).then(c => {
            res.send('Cat created: ' + c.id);
        }, err => {
            res.send('Error: '+ err);
        });
    }
);
// get all cats and do login 
app.get('/listcats', (req, res) => {
	console.log(req.user);
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

app.get('/', (req, res) => {
	if(req.user !== undefined)
		console.log(req.user);
		//return res.render('index', { title: 'Hey', message: 'Hello'  })
		return res.render('index')
});

app.post('/login', passport.authenticate('local', { successRedirect: '/home', failureRedirect: '/' }));

app.get('/home', (req, res) => {
	return res.render('home');
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

//get by category: web service
app.get('/getcatbycategory/:category', (req, res) => {
    Cat.find({"category": (req.params.category)}, (err, result) => {
	if (err) return err;
	res.send(result);
	});
});
// get by category form
app.get('/getcatbycategory', (req, res) => {
	const catList = [];
	console.log(JSON.stringify(req.query.searchcategory));
    Cat.find({"category": (req.query.searchcategory)}, (err, results) => {
	if (err) return err;
	//res.render('searchres', result);
	// Loop check on each row
	  		for (var i = 0; i < results.length; i++) {

	  			// Create an object to save current row's data
		  		var onecat = {
					'id':results[i]._id,
					'time':results[i].time,
		  			'category':results[i].category,
		  			'title':results[i].title,
		  			'details':results[i].details,
		  			'thumbnail':results[i].thumbnail
		  		}
		  		// Add object into array
		  		catList.push(onecat);
	  	}

	  	// Render index.pug page using array 
	  	res.render('searchres', {"catList": catList});
	  	})
});

app.get('/testingpug', function (req, res) {
  res.render('searchres', { title: 'Hey', message: 'Hello there!' })
})

//updaterecord?itemId=1492428207578&updatecatname=Rhigonzi&updateDescription=lets+hope+it+works&updatecategory=sister
// patch a cat record
//app.get('/updaterecord/:itemId/:updatecatname/:updateDescription/:updatecategory', (req, res) => {
app.get('/updaterecord', (req, res) => {
	console.log(JSON.stringify(req.query.itemId));
  Cat.findOneAndUpdate({_id: req.query.itemId}, {
    $set: {
      title: req.query.updatecatname,
      details: req.query.updateDescription,
	  category: req.query.updatecategory
    }
  }, {
    sort: {_id: -1},
    upsert: false
  },(err, result) => {
    if (err) return res.send(err)
    //res.send(result)
	res.redirect('/viewdetails.html');
  })
});

//update cat fully
app.put('/updatecat', (req, res) => {
  //db.collection('quotes')
  console.log(JSON.stringify(req.params));
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

app.get('/delete/:id/:filename', function(req, res){
    //var db = req.db;
	console.log(JSON.stringify(req.params));
	glob('public/files/uploads/'+req.params.filename, function(err,files){
		if (err) throw err;
		files.forEach(function(item,index,array){
			console.log(item + " found");
		});
		// Delete files
		files.forEach(function(item,index,array){
			fs.unlink(item, function(err){
               if (err) throw err;
               console.log(item + " deleted");
			});
		});
	});
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

	//app.listen(3006);