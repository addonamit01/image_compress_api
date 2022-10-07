const admzip = require("adm-zip");
const fs = require("fs");
const gm = require("gm");
const imagemin = require("imagemin");
const imageminJpegRecompress = require("imagemin-jpeg-recompress");
const imageminPngquant = require("imagemin-pngquant");
const { updateApiAccessLimit } = require('../controllers/AuthController');

exports.imageCompress = async (req, res) => {
    const userId = JSON.parse(req.body.user).id;
    updateApiAccessLimit({ userId });
    const file = req.files;
    const zip = new admzip();
    let destinationPath = [];
    if (file) {
        for (let index = 0; index < file.length; index++) {
            console.log(file[index].path);
            const array_of_allowed_file_types = ['image/png', 'image/jpeg', 'image/jpg'];
            if (!array_of_allowed_file_types.includes(file[index].mimetype)) {
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
            if (err) {
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
}

exports.errorHandler = (error, req, res, next) => {
    if (error.code == "LIMIT_UNEXPECTED_FILE") {
        res.status(400).send({ message: "Allow only 20 Image" });
    }
    res.status(400).send({ error: error.message });
}

exports.uploadImage = (req, res) => {
    if (req.user) {
        res.render('index', {
            user: JSON.stringify(req.user)
        });
    } else {
        res.redirect('/login');
    }
}

exports.convertImage = (req, res) => {
    if (req.user) {
        res.render('image_convert', {
            user: JSON.stringify(req.user)
        });
    } else {
        res.redirect('/login');
    }
}

exports.imageConvert = (req, res) => {
    const file = req.file;
    const imageFormat = req.body.format;
    if (file)
    {   
        const fileName = file.filename;
        const lastIndex = fileName.lastIndexOf('.');
        const getFileName = fileName.slice(0, lastIndex);
        const destination = `output/${getFileName}.${imageFormat}`;

        gm(file.path)
        .write(destination, function (err) {
            if (err) console.log(err);
            res.download(destination, (err) => {
                fs.unlinkSync(file.path);
                fs.unlinkSync(destination);
                if (err) {
                    res.send("Error in downloading file");
                }
            });
        });
    }
}