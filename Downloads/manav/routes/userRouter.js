const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken")
const User = require('../models/User');

const router = express.Router();

module.exports = (secretOrPrivateKey) => {
  router.get('/', (req, res) => {
    res.render('login');
  });
  router.post('/register', async (req, res) => {
    try {
      const salt = await bcrypt.genSalt(10);
      const user = new User({
        name: req.body.name,
        email: req.body.email,
        password: await bcrypt.hash(req.body.password, salt),
      });
  
      const result = await user.save();
      const { password, ...data } = await result.toJSON();
  
      // Redirect to the user page after successful registration
      res.redirect('/user');
    } catch (error) {
      res.status(500).send(error.message);
    }
  });
  
   router.post('/authenticate', async (req, res) => {
    try {
      const isLogin = req.body.action === 'login';

      if (isLogin) {
        // Handle login
        const user = await User.findOne({ email: req.body.email });

        if (!user) {
          return res.status(404).send({
            message: 'User not found',
          });
        }

        const isPasswordValid = await bcrypt.compare(req.body.password, user.password);

        if (!isPasswordValid) {
          return res.status(401).send({
            message: 'Invalid credentials',
          });
        }

        const token = jwt.sign({ _id: user._id }, secretOrPrivateKey);

        res.cookie('jwt', token, {
          httpOnly: true,
          maxAge: 24 * 60 * 60 * 1000,
        });

        res.status(200).send({ redirect: '/dashboard' });
      } else {
        // Handle registration
        const salt = await bcrypt.genSalt(10);
        const user = new User({
          name: req.body.name,
          email: req.body.email,
          password: await bcrypt.hash(req.body.password, salt),
        });

        const result = await user.save();
        const { password, ...data } = await result.toJSON();

        res.status(200).send({ redirect: '/login' });
      }
    } catch (error) {
      res.status(500).send(error.message);
    }
  });


  router.route("/login")
  .get((req, res) => {
    // Render your login form here (if needed)
    res.render('login');
  })
  .post(async (req, res) => {
    try {
      const user = await User.findOne({ email: req.body.email });

      if (!user) {
        return res.status(404).send({
          message: 'User not found',
        });
      }

      const isPasswordValid = await bcrypt.compare(req.body.password, user.password);

      if (!isPasswordValid) {
        return res.status(401).send({
          message: 'Invalid credentials',
        });
      }

      const token = jwt.sign({ _id: user._id }, secretOrPrivateKey);

      res.cookie("jwt", token, {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
      });

      // Redirect to another page or render a different view after successful login
      res.redirect('/user'); // Change '/dashboard' to the desired route

    } catch (error) {
      res.status(500).send(error.message);
    }

    // res.redirect('/user');

  });


  router.get('/register', (req, res) => {
    res.render('register');
  });
  
  router.get('/login', (req, res) => {
    res.render('login');
  });
  
  router.get('/dashboard', (req, res) => {
    res.render('dashboard');
  });




  router.get('/user', async (req, res) => {
    try {
      const cookies = req.cookies;
      const jwtToken = cookies['jwt'];
      const claims = jwt.verify(jwtToken, secretOrPrivateKey);
  
      if (!claims) {
        return res.status(401).send({
          message: 'unauthenticated',
        });
      }
  
      const user = await User.findOne({ _id: claims._id });
  
      if (!user) {
        return res.status(404).send({
          message: 'User not found',
        });
      }
  
      // Render the user EJS template with user data
      res.render('user', { user });
    } catch (error) {
      console.error(error);
      res.status(500).send({
        message: 'Internal Server Error',
      });
    }
  });
  
  
  
  router.route("/logout")
  .get((req, res) => {
    // Render your logout page here
    res.render('logout');
  })
  .post((req, res) => {
    // Clear the cookie and handle the logout logic
    res.clearCookie('jwt');
    res.redirect('/'); // Redirect to home or another page after logout
  });
  
  // router.get('/logout', (req, res) => {
  //   res.render('logout');
  // });
  return router;
};

