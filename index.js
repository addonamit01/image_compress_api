const express = require("express");
const dotenv = require("dotenv");
const cookieParser = require('cookie-parser');
const app = express();

dotenv.config();

app.use(express.static('public'));
// Parse URL-encoded bodies (as sent by HTML forms)
app.use(express.urlencoded({ extended: false }));
// Parse JSON bodies (as sent by API clients)
app.use(express.json());
app.use(cookieParser());

app.set('view engine', 'hbs');

// Define Routes
app.use('/', require('./routes/pages'));
app.use('/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server is listening on port ${port}`));