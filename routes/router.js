var express =  require('express'),
 multer  = require('multer'),
 router = express.Router(),
 bcrypt = require('bcrypt'),
 parser = require('body-parser'),
 fs = require('fs');
 // Blob = require('blob-util');
 // require(Blob);

const saltRounds = 10;

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, req.body.id + '-' +file.fieldname + '-' + Date.now()+".jpeg")
  }
})

var upload = multer({ storage: storage })

var passport = require('passport');


router.use(parser.json());

router.get('/', function(req, res, next) {
  	res.render('index.hbs', { title: 'Basic Login System' });
});

router.get('/login', function (req, res, next) {
	res.render('login.hbs', {title: 'Log in form'})
});	

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

router.get('/logout' , function(req, res) {
	req.logout();
	req.session.destroy();
	res.redirect('/');
});

router.get('/registerStudent', function (req, res, next) {
	res.render('registerStudent.hbs', {title: 'Registration a Student'})
});	

router.post('/registerStudent', upload.single('img') , function (req, res, next) {
	const db = require('../dbconfig.js')

	console.log(req.file);
	var id = req.body.id,
		img = req.file.path;
		image = fs.readFileSync(img);

		// console.log("image is " + image);
		query = db.query('INSERT INTO student (id, img)  VALUES (?, ?) ', [id, image], function (err, result, fields) {
			if(err) {
				if (err.code === "ER_DUP_ENTRY") res.render('registerStudent.hbs', {
					title : 'Registration a Student',
					msg : 'Student Data Already Exists'
				});
				else throw err;
			}
			else res.render('registerStudent.hbs', {title: 'Registration a Student', msg : 'Student data inserted'});
		});


});	

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
		// console.log(bufferBase64)
		res.send(bufferBase64);
	});
});


router.get('/viewStudents', function (req, res, next) {
	res.render('students.hbs', {title: 'Students'})
});	

router.get('/facultyRegister', function (req, res, next) {
	res.render('facultyRegister.hbs', {title: 'Registration Faculty'})
});	


router.post('/facultyRegister', function (req, res, next) {
	const db = require('../dbconfig.js')

	console.log(req.body);

	var id = req.body.id,
		dob = req.body.dob,
		password = req.body.password;

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