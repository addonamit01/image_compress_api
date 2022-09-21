const db = require('../config/db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');


exports.login = async (req, res) => {
  try {
	const { email, password } = req.body;

	if( !email || !password ) {
	  return res.status(400).render('login', {
		message: 'Please provide an email and password'
	  })
	}

	db.query('SELECT * FROM users WHERE email = ?', [email], async (error, results) => {
	  console.log(results);
	  if( !results || !(await bcrypt.compare(password, results[0].password)) ) {
		res.status(401).render('login', {
		  message: 'Email or Password is incorrect'
		})
	  } else {
		const id = results[0].id;

		const token = jwt.sign({ id }, process.env.JWT_SECRET, {
		  expiresIn: process.env.JWT_EXPIRES_IN
		});

		console.log("The token is: " + token);

		const cookieOptions = {
		  expires: new Date(
			Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000
		  ),
		  httpOnly: true
		}

		res.cookie('jwt', token, cookieOptions );
		// res.status(200).json({
		//     "Jwt": token
		// });
		res.status(200).redirect("/");
	  }

	})

  } catch (error) {
	console.log(error);
  }
}

exports.register = (req, res) => {
	console.log(req.body);
	
	const { name, email, password, passwordConfirm, phoneNumber } = req.body;
	
	db.query('SELECT email FROM users WHERE email = ?', [email], async (error, results) => {
		if (error)
		{
			console.log(error);
		}

		if (results.length > 0)
		{
			// return res.status(409).json({ message: 'That email is already in use' });
			return res.render('register', {
				message: 'That email is already in use',
				class: 'danger'
			})
		}
		else if (password !== passwordConfirm) {
		  return res.render('register', {
			  message: 'Passwords do not match',
			  class: 'danger'
		  });
		}

		let hashedPassword = await bcrypt.hash(password, 8);
		console.log(hashedPassword);

		db.query('INSERT INTO users SET ?', {name: name, email: email, password: hashedPassword, phone_number: phoneNumber, api_access_limit: 20 }, (error, results) => {
			if(error) 
			{
				console.log(error);
			}
			else
			{
				console.log(results);
				// return res.json({ message: 'User registered' });
				return res.render('register', {
					message: 'User registered',
					class: 'success',
				});
			}
		})
	});
}

exports.logout = async (req, res) => {
  res.cookie('jwt', 'logout', {
	expires: new Date(Date.now() + 2*1000),
	httpOnly: true
  });

  res.status(200).redirect('/');
}

exports.updateApiAccessLimit = async (req, res) => {
	var sql = "UPDATE users SET api_access_limit = api_access_limit-1 WHERE id = ?";
	db.query(sql, [req.userId], function (err, result) {
		if (err) throw err;
		console.log(result.affectedRows + " record(s) updated");
	});
}