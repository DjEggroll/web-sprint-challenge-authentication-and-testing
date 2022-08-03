const { JWT_SECRET } = require('../auth/config');
const jwt = require('jsonwebtoken');
const User = require('../users/users-model');

const restricted = (req, res, next) => {
  const token = req.headers.authorization;
  if(!token){
    return next({ status: 401, message: "token required" });
  }
  jwt.verify(token, JWT_SECRET, (err, decodedToken) => {
    if (err) {
      next({ status: 401, message: "token invalid" })
    } else{
      req.jwt = decodedToken
      next();
    }
  });
  /*
    IMPLEMENT

    1- On valid token in the Authorization header, call next.

    2- On missing token in the Authorization header,
      the response body should include a string exactly as follows: "token required".

    3- On invalid or expired token in the Authorization header,
      the response body should include a string exactly as follows: "token invalid".
  */
};

const validateInputs = (req, res, next) => {
  const { username, password } = req.body;
  if (!username || !password) {
    next({ status: 401, message: "username and password required" })
  } else {
    next();
  }
}


const uniqueUsername = async (req, res, next) => {
  const {username} = req.body;
  const [user] = await User.findBy({ username: username });
  if (user) {
    next({ status: 422, message: "username taken" });
  } else {
    next();
  }
}

const validateUsername = async (req, res, next) => {
  const {username} = req.body;
  const [user] = await User.findBy({ username: username });
  if (user) {
    next();
  } else {
    next({ status: 401, message: "invalid credentials"})
  }
}

module.exports = {
  restricted,
  uniqueUsername,
  validateInputs,
  validateUsername
}