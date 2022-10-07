const multer = require("multer");
const fs = require("fs");
const path = require("path");

let dir = "public";
let subDirectory = "public/uploads";

if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
    fs.mkdirSync(subDirectory);
}

let storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "public/uploads");
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname));
    },
});

let maxSize = 5 * 1024 * 1024; // 5 MB

exports.compressFilesUpload = multer({
    storage: storage,
    limits: { fileSize: maxSize },
    fileFilter: (req, file, cb) => {
        if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg") {
            cb(null, true);
        }
        else {
            cb(null, false);
            return cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
        }
    }
}).array('file', 20);

exports.imageConvert = multer({
    storage: storage
}).single('file');