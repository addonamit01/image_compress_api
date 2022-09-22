const db = require('../config/db');
const bcrypt = require('bcryptjs');

/**
 * API Response
 *
 * @return response()
 */
function apiResponse(results) {
    return JSON.stringify({ "status": 200, "error": null, "response": results });
}

/**
 * Get All Users
 *
 * @return response()
 */
exports.index = (req, res) => {
    let query = "SELECT id, name, phone_number, email, api_access_limit FROM users";

    db.query(query, (err, results) => {
        if (err) throw err;
        res.send(apiResponse(results));
    });
}

/**
 * Get Single User
 *
 * @return response()
 */
exports.show = (req, res) => {
    let query = "SELECT id, name, phone_number, email, api_access_limit FROM users WHERE id=" + req.params.id;

    db.query(query, (err, results) => {
        if (err) throw err;
        res.send(apiResponse(results));
    });
}

/**
 * Create New User
 *
 * @return response()
 */
exports.store = (req, res) => {
    const { name, email, password, phoneNumber } = req.body;

    db.query('SELECT email FROM users WHERE email = ?', [email], async (error, results) => {
        if (error) {
            console.log(error);
        }

        if (results.length > 0) {
            return res.status(409).json({ message: 'That email is already in use' });
        }

        let hashedPassword = await bcrypt.hash(password, 8);

        db.query('INSERT INTO users SET ?', { name: name, email: email, password: hashedPassword, phone_number: phoneNumber, api_access_limit: 20 }, (error, results) => {
            if (error) {
                throw error;
            }
            else {
                res.send(apiResponse({ message: 'User Registered Successfully' }));
            }
        })
    });
}

/**
 * Update User
 *
 * @return response()
 */
exports.update = (req, res) => {
    const { name, email, password, phoneNumber } = req.body;
    const id = req.params.id;

    db.query('SELECT id FROM users WHERE id = ?', [id], async (error, results) => {
        if (error) {
            console.log(error);
        }

        if (results.length == 0) {
            return res.status(404).json({ message: 'User Not Found' });
        }

        let hashedPassword = await bcrypt.hash(password, 8);

        let query = `UPDATE users SET name = "${name}", email = "${email}", password = "${hashedPassword}", phone_number = "${phoneNumber}" WHERE id = "${id}"`;

        db.query(query, (error, results) => {
            if (error) {
                throw error;
            }
            else {
                res.send(apiResponse({ message: 'User Updated Successfully' }));
            }
        })
    });
}

/**
 * Delete User
 *
 * @return response()
 */
exports.delete = (req, res) => {
    const id = req.params.id;

    db.query('SELECT id FROM users WHERE id = ?', [id], (error, results) => {
        if (error) {
            console.log(error);
        }

        if (results.length == 0) {
            return res.status(404).json({ message: 'User Not Found' });
        }

        const query = `DELETE FROM users WHERE id= "${id}"`;

        db.query(query, (err, results) => {
            if (error) {
                throw error;
            }
            else {
                res.send(apiResponse({ message: 'User Deleted Successfully' }));
            }
        });
    })
}