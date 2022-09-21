const express = require('express');
const { isLoggedIn } = require('../middleware/CheckLogin');
const { checkApiAccessLimit } = require('../middleware/ApiAccessLimit');
const { compressFilesUpload } = require('../middleware/CompressFileUpload');
const imageController = require('../controllers/ImageController');

const router = express.Router();

router.get('/', isLoggedIn, imageController.uploadImage);

router.post('/', [checkApiAccessLimit, compressFilesUpload], imageController.imageCompress, imageController.errorHandler);

router.get('/register', (req, res) => {
    res.render('register');
});

router.get('/login', (req, res) => {
    res.render('login');
});

module.exports = router;