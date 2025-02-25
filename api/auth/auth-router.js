// Require `checkUsernameFree`, `checkUsernameExists` and `checkPasswordLength`
// middleware functions from `auth-middleware.js`. You will need them here!
const bcrypt = require('bcryptjs')
const router = require('express').Router()
const User = require('../users/users-model')
const { checkUsernameFree, checkUsernameExists,
  checkPasswordLength } = require('./auth-middleware');

router.post('/register', checkUsernameFree, checkPasswordLength, async (req, res, next) => {
  try {
    const { username, password } = req.body
    const newUser = {
      username,
      password: bcrypt.hashSync(password, 8)
    }
    const created = await User.add(newUser)
    res.status(201).json(created)
  } catch (err) {
    next(err)
  }
})

/**
  1 [POST] /api/auth/register { "username": "sue", "password": "1234" }

  response:
  status 200
  {
    "user_id": 2,
    "username": "sue"
  }

  response on username taken:
  status 422
  {
    "message": "Username taken"
  }

  response on password three chars or less:
  status 422
  {
    "message": "Password must be longer than 3 chars"
  }
 */
  router.post('/login', checkUsernameExists, async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const [user] = await User.findBy({ username });
    const doesPasswordCheck = bcrypt.compareSync(password, user.password);
    if (!doesPasswordCheck) {
      return next({ status: 401, message: "Invalid credentials" })
    }
    req.session.user = user;
    res.json({ message: `welcome ${username}`})
  } catch (err) {
    next(err)
  }
})
/**
  2 [POST] /api/auth/login { "username": "sue", "password": "1234" }

  response:
  status 200
  {
    "message": "Welcome sue!"
  }

  response on invalid credentials:
  status 401
  {
    "message": "Invalid credentials"
  }
 */


/**
  3 [GET] /api/auth/logout

  response for logged-in users:
  status 200
  {
    "message": "logged out"
  }

  response for not-logged-in users:
  status 200
  {
    "message": "no session"
  }
 */
  router.get('/logout', async (req, res, next) => { 
    if (!req.session.user) {
      return res.json({ message: 'no session' })
    }
    req.session.destroy((err) => {
      if (err) {
        return res.json({ message: 'error while logging out' })
      }
      res.json({ message: 'logged out' })
    })
  })
   
 
// Don't forget to add the router to the `exports` object so it can be required in other modules
module.exports = router;