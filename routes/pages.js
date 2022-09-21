const express = require('express');
const authController = require('../controllers/auth');

const router = express.Router();

router.get('/', authController.isLoggedIn, (req, res) => {
    if (req.user) {
        res.render('index', {
            user: JSON.stringify(req.user)
        });
    } else {
        res.redirect('/login');
    }
});

router.get('/register', (req, res) => {
    res.render('register');
});

router.get('/login', (req, res) => {
    res.render('login');
});

module.exports = router;