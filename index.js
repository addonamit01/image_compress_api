const express = require("express");
const multer = require("multer");
const admzip = require("adm-zip");
const fs = require("fs");
const path = require("path");
const imagemin = require("imagemin");
const imageminJpegRecompress = require("imagemin-jpeg-recompress");
const imageminPngquant = require("imagemin-pngquant");
const app = express();

let dir = "public";
let subDirectory = "public/uploads";

app.use(express.static('public'));

if (!fs.existsSync(dir))
{
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

let compressFilesUpload = multer({
    storage: storage,
    limits: { fileSize: maxSize },
    fileFilter: (req, file, cb) => {
        if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg")
        {
            cb(null, true);
        }
        else
        {
            cb(null, false);
            return cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
        }
    }
});

app.get('/', (req, res) => {
    res.sendFile(__dirname + "/index.html");
});

app.post('/', compressFilesUpload.array('file', 20), async (req, res) => {
    const file = req.files;
    const zip = new admzip();
    let destinationPath = [];
    if (file)
    {
        for (let index = 0; index < file.length; index++)
        {
            console.log(file[index].path);
            const array_of_allowed_file_types = ['image/png', 'image/jpeg', 'image/jpg'];
            if (!array_of_allowed_file_types.includes(file[index].mimetype))
            {
                res.send("File type not allowed");
                throw Error('Invalid file');
            }

            const files = await imagemin([file[index].path], {
                destination: "output",
                plugins: [
                    imageminJpegRecompress({
                        min: 20,
                        max: 60
                    }),
                    imageminPngquant({
                        quality: [0.2, 0.6]
                    })
                ]
            });

            for (var key in files) {
                destinationPath.push(files[key].destinationPath);
                zip.addLocalFile(files[key].destinationPath);
            }
        }

        let outputPath = Date.now() + "_output.zip";

        fs.writeFileSync(outputPath, zip.toBuffer());
        res.download(outputPath, (err) => {
            if (err)
            {
                file.forEach(file => {
                    fs.unlinkSync(file.path);
                });
                destinationPath.forEach(path => {
                    fs.unlinkSync(path);
                });
                fs.unlinkSync(outputPath);
                res.send("Error in downloading zip file");
            }

            file.forEach(file => {
                fs.unlinkSync(file.path);
            });
            destinationPath.forEach(path => {
                fs.unlinkSync(path);
            });
            fs.unlinkSync(outputPath);
        });
    }
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message })
});


app.listen(5000, function () {
    console.log("Server is listening on port 5000");
});