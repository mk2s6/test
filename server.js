//Genral server packages
const express = require('express');
const app = express();

//General parser packages
const path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var bodyParser = require('body-parser');

//Password hashing package
var bcrypt = require('bcrypt');
const saltRounds = 10;

const hbs = require('express-hbs');

const index = require('./routes/router');
const fs = require('fs');

//Sessions
var session = require('express-session');
var MySQLStore = require('express-mysql-session')(session);

//authentication package and implementation strategy
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;


//dotenv for parsing environment variables
require('dotenv').config();


//setting up directores
app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/src'));


//setting up parsers
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());


//setting up view engine 
app.engine('hbs', hbs.express4({
  partialsDir: __dirname + '/views/partials'
}));
app.set('views', path.join(__dirname , '/views'));
app.set('view engine', '.hbs');


//setting server and listeing port
const port = process.env.SERVER_PORT || 4200;
app.listen(port, function (req, res) {
	console.log('Server listnening at ' + port);
});


//setting session preset options
var options = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
  	password: process.env.DB_PASSWORD,
  	database : process.env.DB_NAME
};

//Adding sessions to DB
var sessionStore = new MySQLStore(options);

//Snipeet which creates session variables and uses
app.use(session({
	secret: 'askjnaqjcne',
	resave: false,
	store: sessionStore,
	saveUninitialized: false,
}));


//Serving Authentication Packages
app.use(passport.initialize());
app.use(passport.session());
passport.authenticate('local');


//Setting locals
app.use(function(req, res, next) {
	res.locals.isAuthenticated = req.isAuthenticated();
	res.locals.username = req.user;
	next();
});

//Appling routes
app.use(index);

//Error Handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});
app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  res.render('error' , {title : "Some internal Error please try again later or contact administrator"});
});



//Implementing Authentication strategy
passport.use(new LocalStrategy(
 	function(username, password, done) {
	const db = require('./dbconfig.js')

		console.log(username)
	   	query = db.query('SELECT * FROM faculty WHERE id = ? ', [username], function(err, results, fields) {
	   		if (err) {
	   			console.log('error')
	   			throw err};

	   		if (results.length === 0 ) {
	   			done(null, false , "Invalid Username");
	   		} else {

		   		const hash = results[0].password.toString();
		   		bcrypt.compare(password, hash, function (err, result) {
		   			if (result) {
		   				return done(null,results[0].id);
		   			} else {
		   				return done(null, false, "Invalid password");
		   			}
		   		});	
	   		}

	   	});
    }
));

