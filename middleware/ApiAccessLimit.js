const db = require('../config/db');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');


exports.checkApiAccessLimit = async (req, res, next) => {
    if (req.cookies.jwt) {
        try {
            //1) verify the token
            const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET);

            //2) Check if the user still exists
            db.query('SELECT * FROM users WHERE id = ?', [decoded.id], (error, result) => {

                if (!result) {
                    return next();
                }

                let apiLimit = result[0].api_access_limit;
                if (apiLimit > 0) {
                    return next();
                }
                else {
                    return res.status(429).send({ error: "API access limit is over" });
                }
            });
        }
        catch (error) {
            console.log(error);
            return next();
        }
    }
    else {
        next();
    }
}