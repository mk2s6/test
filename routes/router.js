//Routes package
var express =  require('express'),
 router = express.Router(),

 //Package used to upload files
 multer  = require('multer'),

 //General parsers
 parser = require('body-parser'),
 fs = require('fs');


//PassWord hashing
bcrypt = require('bcrypt');
const saltRounds = 10;


//Setting up storage for multer
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, req.body.id + '-' +file.fieldname + '-' + Date.now()+".jpeg")
  }
})
var upload = multer({ storage: storage })

//authentication package
var passport = require('passport');

//Initializing parser
router.use(parser.json());

//Main Route
router.get('/', function(req, res, next) {
  	res.render('index.hbs', { title: 'Basic Login System' });
});

//getting Login Page
router.get('/login', function (req, res, next) {
	res.render('login.hbs', {title: 'Log in form'})
});	


//Signing in using passport throug post method of route /login
router.post('/login', function(req, res, next) {
	passport.authenticate('local', function(err, user, info) {
		if (err) return next(err);
		console.log(user)
		if (!user) { 
			console.log(info);
      		res.render('login.hbs', {title : "Log in form", errMsg : info}); 
      		return false;
      	}
      	console.log(user);
		req.logIn(user, function(err) {
			if (err) {
				console.log("Error is here")
				return next(err)
			};
			return res.redirect('/');
	});
})(req, res, next);
});


//logout route
router.get('/logout' , function(req, res) {
	req.logout();
	req.session.destroy();
	res.redirect('/');
});

//Student Register page
router.get('/registerStudent', function (req, res, next) {
	res.render('registerStudent.hbs', {title: 'Registration a Student'})
});	

//Posting Student data image + id to backend
router.post('/registerStudent', upload.single('img') , function (req, res, next) {
	const db = require('../dbconfig.js')
	var id = req.body.id,
		img = req.file.path;
		image = fs.readFileSync(img);
		query = db.query('INSERT INTO student (id, img)  VALUES (?, ?) ', [id, image], function (err, result, fields) {
			if(err) {
				if (err.code === "ER_DUP_ENTRY") res.render('registerStudent.hbs', {
					title : 'Registration a Student',
					msg : 'Student Data Already Exists'
				});
				else if (err.code === "ER_NET_PACKET_TOO_LARGE") res.render('registerStudent.hbs', {
					title : 'Registration a Student',
					msg : 'Image Size is too large'
				});
				else throw err;
			}
			else res.render('registerStudent.hbs', {title: 'Registration a Student', msg : 'Student data inserted'});
		});


});	

//Getting the id's of students
router.get('/getOptions', function (req, res) {
	const db = require('../dbconfig.js')
	// console.log("rvwneuiwniuiunwiu")
	query = db.query('SELECT id FROM student', function (err, result, fields) {
		if (err) throw err;
		console.log(result)
		var string = JSON.stringify(result);
		var str = JSON.parse(string);
		res.send({options : str})
	});
});

//fetching images from database and sending it to the front end
router.get('/getImage/:id', function (req, res) {
	const db = require('../dbconfig.js');
	const id = req.params.id;
	
	query = db.query('SELECT img FROM student WHERE id = ?', [id], function (err, result, fields) {
		if (err) throw err;
		var string = JSON.stringify(result);
		var img = JSON.parse(string);
		var blob = img[0].img;
		var buffer = new Buffer( blob );
		var bufferBase64 = buffer.toString('base64');
		res.send(bufferBase64);
	});
});

//Page that used to view student details
router.get('/viewStudents', function (req, res, next) {
	res.render('students.hbs', {title: 'Students'})
});	

//rendering Registering Faculty page
router.get('/facultyRegister', function (req, res, next) {
	res.render('facultyRegister.hbs', {title: 'Registration Faculty'})
});	

//Adding the faculty to the database
router.post('/facultyRegister', function (req, res, next) {
	const db = require('../dbconfig.js')
	var id = req.body.id,
		dob = req.body.dob,
		password = req.body.password;
	//Hasing password of faculty
	bcrypt.hash(password, saltRounds, function(err, hash) {
		query = db.query('INSERT INTO faculty (id, dob, password) VALUES (?, ?, ?)',[id, dob, hash], function (err, result, fields) {
			if (err) {
				if (err.code === "ER_DUP_ENTRY") res.send({
					redirectTo: '/login',
					msg : 'User Already Exists'
				});
			} else {

				db.query('SELECT * FROM faculty ORDER BY ID DESC LIMIT 1', function(err, results, fields) {
					if (err) throw err;

					const userId = results[0].username;
					req.login(userId, function (err) {
						if (err) console.log(err);
						res.send({
							redirectTo: '/',
							msg: 'User Registerd Successfully'
						});
					});

				});
			}
		});
	});
});	



//Authentication implementation of getting and posting the users
passport.serializeUser(function(userId, done) {
	console.log("ser")
  done(null, userId);
});

passport.deserializeUser(function(userId, done) {
	console.log("deser - " + userId)
    done(null, userId);
});

function authenticationMiddleware () {  
	return (req, res, next) => {
		console.log(`req.session.passport.user: ${JSON.stringify(req.session.passport)}`);

	    if (req.isAuthenticated()) return next();
	    res.redirect('/login')
	}
}


module.exports = router;