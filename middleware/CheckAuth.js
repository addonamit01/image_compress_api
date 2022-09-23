const db = require('../config/db');
const jwt = require('jsonwebtoken');


exports.checkAuth = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const query = `SELECT * FROM users WHERE id = ${decoded.id} AND is_admin = 1`;

        db.query(query, (error, result) => {
            if (!result || result.length === 0)
            {
                return res.status(401).json({
                    message: "You are not allowed to access this API",
                    error: error
                });
            }

            req.user = result[0];
            console.log("user is")
            console.log(req.user);
            return next();
        });
    }
    catch (error) {
        return res.status(401).json({
            message: "Invalid or expired token provided!",
            error: error
        });
    }
}