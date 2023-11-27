const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const cors = require("cors");
const cookieParser = require('cookie-parser');

// express app
const app = express();

const dbURI = "mongodb+srv://jwt:johnkennedy12@nodetuts.7b2vfyt.mongodb.net/";

// Middleware for logging HTTP requests
app.use(morgan('dev'));
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
mongoose.connect(dbURI)
  .then(() => {
    console.log('Connected to the database');
  })
  .catch((err) => {
    console.error('Error connecting to the database:', err);
  });

// Define the secretOrPrivateKey
const secretOrPrivateKey = 'secret';

// Pass the secretOrPrivateKey to the router
const routes = require('./routes/userRouter')(secretOrPrivateKey);

app.use(cookieParser());

app.use(cors({
  credentials: true,
  origin: ['http://localhost:8080']
}));

// Fix: Use 'app.use' instead of 'app = express()'
app.use(express.json());
app.use('/', routes);

const PORT = 7000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
